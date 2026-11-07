/**
 * pack.js - Script de empaquetado personalizado para Gestor
 * 
 * Copia los archivos de Electron desde node_modules y arma la estructura
 * de la aplicación sin necesitar electron-builder ni winCodeSign.
 */

const fs   = require('fs');
const path = require('path');

const ROOT    = __dirname;
const DIST    = path.join(ROOT, 'dist', 'win-unpacked');
const ELECTRON_DIST = path.join(ROOT, 'node_modules', 'electron', 'dist');

// === Utilidades ===

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isSymbolicLink()) {
      // Ignorar enlaces simbólicos (archivos macOS dentro del zip de Electron)
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function log(msg) {
  console.log(`    ${msg}`);
}

// === Limpieza ===

log('Limpiando directorio de salida...');
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });

// === 1. Copiar Electron ===

log('Copiando binarios de Electron...');
if (!fs.existsSync(ELECTRON_DIST)) {
  console.error(`ERROR: No se encontró la instalación de Electron en node_modules en: ${ELECTRON_DIST}`);
  console.error('Por favor, ejecuta "npm install" primero en gestorDesktop.');
  process.exit(1);
}
copyDir(ELECTRON_DIST, DIST);

// Renombrar electron.exe -> Gestor.exe
const electronExe = path.join(DIST, 'electron.exe');
const gestorExe   = path.join(DIST, 'Gestor.exe');
if (fs.existsSync(electronExe)) {
  fs.renameSync(electronExe, gestorExe);
  log('Renombrado: electron.exe -> Gestor.exe');
}

// === 2. Crear estructura de recursos ===

const appDir     = path.join(DIST, 'resources', 'app');
const backendDir = path.join(DIST, 'resources', 'backend');
fs.mkdirSync(appDir,     { recursive: true });
fs.mkdirSync(backendDir, { recursive: true });

// === 3. Copiar archivos de la app ===

log('Copiando main.js, preload.js y splash.html...');
fs.copyFileSync(path.join(ROOT, 'main.js'),    path.join(appDir, 'main.js'));
fs.copyFileSync(path.join(ROOT, 'preload.js'), path.join(appDir, 'preload.js'));
if (fs.existsSync(path.join(ROOT, 'splash.html'))) {
  fs.copyFileSync(path.join(ROOT, 'splash.html'), path.join(appDir, 'splash.html'));
}

// package.json mínimo necesario para que Electron encuentre el entry point
const pkgJson = {
  name: 'gestor',
  version: '1.1.0',
  main: 'main.js',
};
fs.writeFileSync(
  path.join(appDir, 'package.json'),
  JSON.stringify(pkgJson, null, 2)
);
log('Creado package.json mínimo en app/');

// === 4. Copiar renderer (frontend compilado) ===
const rendererSrc  = path.join(ROOT, 'renderer');
const rendererDest = path.join(appDir, 'renderer');
if (fs.existsSync(rendererSrc)) {
  log('Copiando renderer (frontend React)...');
  copyDir(rendererSrc, rendererDest);
} else {
  log('Omitiendo copia de renderer local (se sirve directamente desde el JAR del backend)');
}

// === 5. Copiar JAR del backend ===
log('Copiando JAR del backend (Spring Boot)...');
const jarLocalFolder = path.join(ROOT, 'backend');
const jarLocalSrc = path.join(jarLocalFolder, 'gestor-0.0.1-SNAPSHOT.jar');
const jarGradleSrc = path.join(ROOT, '..', 'build', 'libs', 'gestor-0.0.1-SNAPSHOT.jar');
const jarDest = path.join(backendDir, 'gestor-0.0.1-SNAPSHOT.jar');

// Si no existe la carpeta local backend, la creamos
if (!fs.existsSync(jarLocalFolder)) {
  fs.mkdirSync(jarLocalFolder, { recursive: true });
}

// Intentar copiar desde build/libs primero si existe para asegurar que esté actualizado
if (fs.existsSync(jarGradleSrc)) {
  log('Detectado JAR actualizado en build/libs. Copiándolo a backend/...');
  fs.copyFileSync(jarGradleSrc, jarLocalSrc);
}

if (fs.existsSync(jarLocalSrc)) {
  fs.copyFileSync(jarLocalSrc, jarDest);
  const sizeMB = (fs.statSync(jarDest).size / 1024 / 1024).toFixed(1);
  log(`JAR copiado (${sizeMB} MB)`);
} else {
  console.error(`ERROR: No se encontró el JAR en ${jarLocalSrc} ni en ${jarGradleSrc}`);
  console.error('Por favor, compila el backend con "./gradlew bootJar" primero.');
  process.exit(1);
}

// Copiar .env si existe en la raíz o en backend
const envRoot = path.join(ROOT, '..', '.env');
const envLocal = path.join(jarLocalFolder, '.env');
const envDest = path.join(backendDir, '.env');
if (fs.existsSync(envRoot)) {
  fs.copyFileSync(envRoot, envDest);
  log('Archivo .env copiado a backend/');
} else if (fs.existsSync(envLocal)) {
  fs.copyFileSync(envLocal, envDest);
  log('Archivo .env copiado a backend/');
}

// Copiar base de datos con datos precargados si existe
const dbFile = path.join(ROOT, '..', 'data', 'gestordb.mv.db');
if (fs.existsSync(dbFile) && fs.statSync(dbFile).size > 0) {
  const backendDataDir = path.join(backendDir, 'data');
  fs.mkdirSync(backendDataDir, { recursive: true });
  fs.copyFileSync(dbFile, path.join(backendDataDir, 'gestordb.mv.db'));
  log('Base de datos inicial copiada a resources/backend/data/');
} else {
  log('Sin base de datos preexistente: la aplicación creará una base de datos limpia al iniciar.');
}

// === 6. Resumen ===

const exeSize = (fs.statSync(gestorExe).size / 1024 / 1024).toFixed(1);
console.log('');
console.log('Empaquetado completado.');
console.log(`   Ejecutable: ${gestorExe} (${exeSize} MB)`);
console.log(`   Para distribuir: comprime toda la carpeta dist/win-unpacked/`);
