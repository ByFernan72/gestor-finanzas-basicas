# Documentación Técnica - Arquitectura del Sistema

Esta documentación describe el diseño interno, la infraestructura de datos y el flujo de ejecución del proyecto **Gestor**.

---

## 1. Stack Tecnológico

- **Lenguaje:** Java 21 (LTS).
- **Framework Backend:** Spring Boot 3.4.1.
- **Persistencia:** Spring Data JPA / Hibernate 6.x.
- **Base de Datos:** H2 Database Engine (modo embebido persistente en disco).
- **Aplicación de Escritorio:** Electron y Node.js (con empaquetado standalone).
- **Construcción y Dependencias:** Gradle.

---

## 2. Arquitectura de Capas

El backend sigue un patrón en capas estándar de Spring:

```text
com.gestorBackend
├── Config/            # Configuraciones CORS, WebMvc, Seguridad
├── Controller/        # Controladores REST exponiendo endpoints HTTP JSON
├── Dto/               # Data Transfer Objects (Request / Response) con validación Bean Validation
├── Exception/         # GlobalExceptionHandler centralizado (@ControllerAdvice)
├── Model/             # Entidades JPA (@Entity) mapeadas a tablas relacionales
├── Repository/        # Interfaces Spring Data JPA (JpaRepository)
└── Service/           # Capa lógica de negocio y transacciones (@Transactional)
    └── Impl/          # Implementaciones de los servicios
```

---

## 3. Modelo y Persistencia de Datos (H2)

La base de datos actual utiliza el motor **H2** en modo archivo persistente.

### Entidades Principales:
- **Cartera (cartera):** Agrupador principal de activos. Contiene id, nombre, descripción y fecha de creación.
- **Activo (activo):** Registro de instrumentos con id, fk id_cartera, nombre, balance (BigDecimal), tipo (TipoActivo) y fecha de obtención.
- **Movimiento (movimiento):** Historial transaccional entre activos/carteras origen y destino con cantidades transferidas.
- **Historial (historial):** Snapshots periódicos de balances para reconstrucción de gráficos históricos.
- **Perfil (perfil):** Información del usuario y enlaces guardados (perfil_links).
- **Operación Programada (operacion_programada):** Automatización periódica de movimientos (ingresos, gastos o transferencias) con id, carteras/activos origen y destino, cantidad, frecuencia temporal (SEMANAL, QUINCENAL, MENSUAL, TRIMESTRAL, ANUAL), proxima_ejecucion y estado is_active.
- **Configuración (config):** Almacén clave-valor persistente para marcas temporales del sistema (ej. fecha_ultimo_guardado) y flags internos.

### Gestión DDL:
Hibernate se encuentra configurado con spring.jpa.hibernate.ddl-auto=update, lo que permite:
- Creación automática de tablas y secuencias en el primer arranque.
- Alteración automática de columnas al añadir nuevos atributos en las entidades JPA.
- Preservación total de los datos existentes.

---

## 4. Configuración y Variables de Entorno

La configuración se maneja a través de `application.properties` con soporte de sustitución mediante `.env`:

| Variable | Descripción | Valor por Defecto |
|---|---|---|
| APP_NAME | Nombre de la aplicación Spring Boot | gestor |
| SERVER_PORT | Puerto de escucha HTTP | 8080 |
| DB_URL | Cadena JDBC de conexión H2 | jdbc:h2:file:./data/gestordb;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE |
| DB_DRIVER | Clase del driver JDBC | org.h2.Driver |
| DB_USERNAME | Usuario de base de datos | admin |
| DB_PASSWORD | Contraseña de base de datos | admin |
| JPA_DIALECT | Dialecto Hibernate | org.hibernate.dialect.H2Dialect |
| JPA_DDL_AUTO | Estrategia de actualización DDL | update |
| JPA_SHOW_SQL | Loggear sentencias SQL en stdout | false |
| H2_CONSOLE_ENABLED | Habilitar consola web en /h2-console | true |

---

## 5. Ciclo de Vida en Electron (App de Escritorio)

1. Al abrir el ejecutable, `gestorDesktop/main.js` inicializa el proceso y muestra la pantalla de carga (Splash Screen).
2. Electron consulta la carpeta de datos de usuario:
   `app.getPath('userData')/database/gestordb`
3. Electron lanza el backend en un subproceso hijo mediante `spawn(javaExe, ['-jar', jarPath])` inyectando la variable `DB_URL`.
4. Electron sondea `http://localhost:8080/` hasta recibir respuesta HTTP afirmativa y despliega la ventana principal, cerrando el splash screen.
5. Al cerrar la ventana, Electron envía una señal de apagado ordenado al proceso de Spring Boot para cerrar correctamente el archivo de base de datos H2.

---

## 6. Proceso de Rebuild de Gestor.exe (Actualizaciones y .env)

Cuando se modifican las variables en el archivo `.env`, la lógica del backend o la interfaz frontend, el ejecutable empaquetado debe regenerarse:

1. **Recompilar Backend (JAR):**
   ```powershell
   .\gradlew.bat bootJar
   ```
2. **Reempaquetar Desktop:**
   ```bash
   cd gestorDesktop
   npm run dist
   ```
   El script `pack.js` copiará automáticamente el nuevo `.env` y `splash.html` a la carpeta de distribución.

**Precedencia de lectura del .env en producción:**
`main.js` busca el archivo `.env` en varios niveles al arrancar:
1. Junto al ejecutable: `dist/win-unpacked/.env`
2. En recursos del backend: `dist/win-unpacked/resources/backend/.env`
3. En la raíz del repositorio.

Nota: Si solo necesitas cambiar valores de variables (sin tocar código Java o JS), puedes editar directamente el archivo `.env` ubicado en `dist/win-unpacked/resources/backend/.env` o poner un `.env` junto a `Gestor.exe` sin necesidad de recompilar.
