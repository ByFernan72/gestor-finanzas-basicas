'use strict';

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

let mainWindow = null;
let splashWindow = null;
let backendProcess = null;
const BACKEND_PORT = 8080;
const MAX_WAIT_MS = 60000; // 60 segundos máximo para arrancar el backend

// === Obtener la ruta al JAR (funciona tanto en dev como en producción) ===
function getJarPath() {
  if (app.isPackaged) {
    // En producción: los extraResources van a process.resourcesPath/backend/
    return path.join(process.resourcesPath, 'backend', 'gestor-0.0.1-SNAPSHOT.jar');
  }
  // En desarrollo
  return path.join(__dirname, 'backend', 'gestor-0.0.1-SNAPSHOT.jar');
}

// === Obtener Java bundled (runtime de Electron) o del sistema ===
function getJavaExecutable() {
  // Primero intenta usar el Java incluido junto al exe
  const bundledJava = path.join(path.dirname(app.getPath('exe')), 'runtime', 'bin', 'java.exe');
  if (fs.existsSync(bundledJava)) return bundledJava;
  // Fallback: java del PATH del sistema
  return 'java';
}

// === Cargar variables de entorno desde .env sin exponer secretos ===
function loadEnv() {
  const possiblePaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(path.dirname(getJarPath()), '.env'),
    path.join(process.resourcesPath || '', 'backend', '.env'),
    path.join(path.dirname(app.getPath('exe')), '.env'),
  ];

  const envVars = {};
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log('[Gestor] Cargando variables de entorno desde:', p);
      try {
        const content = fs.readFileSync(p, 'utf-8');
        content.split(/\r?\n/).forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const idx = trimmed.indexOf('=');
            if (idx !== -1) {
              const key = trimmed.slice(0, idx).trim();
              const val = trimmed.slice(idx + 1).trim();
              envVars[key] = val;
            }
          }
        });
        break;
      } catch (err) {
        console.error('[Gestor] Error al leer archivo .env:', err);
      }
    }
  }
  return envVars;
}

// === Iniciar el backend Spring Boot ===
function startBackend() {
  return new Promise((resolve, reject) => {
    const jarPath = getJarPath();
    const javaExe = getJavaExecutable();

    console.log('[Gestor] Iniciando backend desde:', jarPath);
    console.log('[Gestor] Usando Java:', javaExe);

    if (!fs.existsSync(jarPath)) {
      reject(new Error('No se encontró el archivo JAR en: ' + jarPath));
      return;
    }

    const jarEnv = { ...process.env, ...loadEnv() };
    
    // Configurar ruta persistente de base de datos H2 en la carpeta de datos de usuario de Electron
    const userDbDir = path.join(app.getPath('userData'), 'database');
    if (!fs.existsSync(userDbDir)) {
      fs.mkdirSync(userDbDir, { recursive: true });
    }
    const userDbFile = path.join(userDbDir, 'gestordb.mv.db');
    
    // Sembrar la base de datos inicial si no existe en userData
    const bundledDb = path.join(path.dirname(jarPath), 'data', 'gestordb.mv.db');
    const rootDb = path.join(__dirname, '..', 'data', 'gestordb.mv.db');
    const templateDb = fs.existsSync(bundledDb) ? bundledDb : (fs.existsSync(rootDb) ? rootDb : null);
    
    if (templateDb && (!fs.existsSync(userDbFile) || fs.statSync(userDbFile).size === 0)) {
      try {
        fs.copyFileSync(templateDb, userDbFile);
        console.log('[Gestor] Base de datos inicial copiada a userData:', userDbFile);
      } catch (e) {
        console.error('[Gestor] No se pudo copiar la base de datos inicial:', e);
      }
    }

    const dbFilePath = path.join(userDbDir, 'gestordb').replace(/\\/g, '/');
    jarEnv.DB_URL = `jdbc:h2:file:${dbFilePath};DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE`;
    console.log('[Gestor] Base de datos configurada en:', jarEnv.DB_URL);

    backendProcess = spawn(javaExe, ['-jar', jarPath], {
      cwd: path.dirname(jarPath),
      env: jarEnv,
      windowsHide: true, // sin ventana de consola en Windows
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    backendProcess.stdout.on('data', (data) => {
      console.log('[Backend]', data.toString().trim());
    });

    backendProcess.stderr.on('data', (data) => {
      console.error('[Backend ERROR]', data.toString().trim());
    });

    backendProcess.on('error', (err) => {
      reject(err);
    });

    backendProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error('[Gestor] Backend terminó con código:', code);
      }
    });

    // Esperar a que el backend responda en el puerto 8080
    waitForBackend(resolve, reject);
  });
}

// === Sondear el backend hasta que responda ===
function waitForBackend(resolve, reject) {
  const start = Date.now();

  function check() {
    const elapsed = Date.now() - start;
    if (elapsed > MAX_WAIT_MS) {
      reject(new Error('Tiempo de espera agotado: el backend no respondió en 60 segundos.'));
      return;
    }

    const req = http.get(`http://localhost:${BACKEND_PORT}/`, (res) => {
      console.log('[Gestor] Backend listo. Código HTTP:', res.statusCode);
      resolve();
    });

    req.on('error', () => {
      // Aún no está listo, reintentar en 500ms
      setTimeout(check, 500);
    });

    req.setTimeout(1000, () => {
      req.destroy();
      setTimeout(check, 500);
    });
  }

  setTimeout(check, 1000); // retardo inicial reducido a 1000ms
}

// === Crear la ventana de carga (Splash Screen) ===
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 420,
    height: 320,
    frame: false,
    transparent: true,
    resizable: false,
    center: true,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const splashFile = path.join(__dirname, 'splash.html');
  splashWindow.loadFile(splashFile);

  splashWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.show();
    }
  });

  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

// === Crear la ventana principal ===
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Gestor de Carteras',
    show: false, // no mostrar hasta que esté lista
    backgroundColor: '#0f0f1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true, // oculta la barra de menú nativa
  });

  // Limpiar caché para asegurar que siempre cargue la última build
  mainWindow.webContents.session.clearCache().then(() => {
    mainWindow.loadURL(`http://localhost:${BACKEND_PORT}/`);
  });

  // Mostrar la ventana principal cuando termine de cargar y cerrar el splash
  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.destroy();
      splashWindow = null;
    }
    mainWindow.show();
    mainWindow.focus();
  });

  // Abrir enlaces externos en el navegador del sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// === Ciclo de vida de Electron ===
app.whenReady().then(async () => {
  // Mostrar pantalla de carga inmediatamente
  createSplashWindow();

  try {
    console.log('[Gestor] Iniciando aplicación...');
    await startBackend();
    console.log('[Gestor] Backend listo. Abriendo ventana principal...');
    createWindow();
  } catch (err) {
    console.error('[Gestor] Error al iniciar:', err.message);
    if (splashWindow) {
      splashWindow.destroy();
      splashWindow = null;
    }
    // Mostrar ventana de error al usuario
    const { dialog } = require('electron');
    dialog.showErrorBox(
      'Error al iniciar Gestor',
      `No se pudo iniciar el servidor de la aplicación.\n\n${err.message}\n\nVerifique que Java esté instalado o reinstale la aplicación.`
    );
    app.quit();
  }
});

function killBackend() {
  if (backendProcess && !backendProcess.killed) {
    console.log('[Gestor] Deteniendo backend...');
    try {
      if (process.platform === 'win32') {
        const { execSync } = require('child_process');
        execSync(`taskkill /pid ${backendProcess.pid} /f /t 2>nul`);
      } else {
        backendProcess.kill('SIGTERM');
      }
    } catch (e) {
      // Proceso ya terminado o no encontrado
    }
  }
}

app.on('window-all-closed', () => {
  killBackend();
  app.quit();
});

app.on('before-quit', () => {
  killBackend();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Asegurarse de matar el backend si Electron termina de forma inesperada
process.on('exit', () => {
  killBackend();
});
