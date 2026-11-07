# Documentación del Proyecto Gestor

Índice general de documentación para usuarios y desarrolladores.

---

## 1. Guía de Usuario
* Documento: [docs/user/GUIA_USUARIO.md](user/GUIA_USUARIO.md)
* **Objetivo:** Explicar de forma clara, sencilla y paso a paso cómo utilizar la aplicación de escritorio:
  * Cómo dar de alta carteras y activos.
  * Cómo registrar movimientos y transferencias entre cuentas.
  * Cómo programar y automatizar operaciones periódicas recurrentes (nóminas, gastos fijos, ahorro automático).
  * Cómo interpretar las métricas del Dashboard.
  * Cómo realizar copias de seguridad de los datos locales (gestordb.mv.db).

---

## 2. Documentación Técnica
* **Arquitectura del Sistema:** [docs/technical/ARQUITECTURA.md](technical/ARQUITECTURA.md)
  * Estructura del stack (Java 21, Spring Boot 3.4, H2 local persistente, Electron).
  * Persistencia, modelos JPA y gestión DDL automática.
  * Variables de entorno (.env / application.properties).
  * Integración y ciclo de vida en Electron.
* **Catálogo de Endpoints REST:** [docs/technical/API_ENDPOINTS.md](technical/API_ENDPOINTS.md)
  * Especificación de todos los endpoints HTTP (/api/v1/cartera, /api/v1/activo, /api/v1/movimiento, /api/v1/dashboard, /api/v1/perfil, etc.).
  * Payloads, DTOs de entrada/salida y códigos de estado HTTP.
  * Formato unificado de errores (GlobalExceptionHandler).

---

## 3. Javadoc de Clases (HTML)
* Directorio: [docs/javadoc/index.html](javadoc/index.html)
* **Objetivo:** Documentación navegable de todas las clases, interfaces, controladores y repositorios Java generada con Gradle.
* Para consultarlo, abre el archivo docs/javadoc/index.html en cualquier navegador web.
