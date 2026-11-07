# Guía de Usuario - Gestor Financiero Personal

Bienvenido al manual de uso de **Gestor**, tu aplicación de escritorio para el control y seguimiento patrimonial de inversiones, cuentas y activos financieros.

---

## 1. Inicio Rápido

### ¿Dónde está la aplicación compilada (Build)?
Dado que los binarios ejecutables no se suben a Git (están en `.gitignore`), tienes dos alternativas para obtener la build:
* **Desde GitHub:** Descarga el archivo comprimido de la aplicación desde la sección **[Releases](https://github.com/ByFernan72/gestor/releases)** y descomprímelo donde prefieras (por ejemplo, en el Escritorio o en `C:\Programas\Gestor`).
* **Desde el código fuente:** Si has clonado el repositorio, compila con `.\gradlew.bat bootJar` y empaqueta ejecutando `cd gestorDesktop && npm run dist`. La build se generará en la carpeta local **`gestorDesktop/dist/win-unpacked/`**.

### Pasos para Abrir la Aplicación:
1. **Localiza el ejecutable:** Entra en la carpeta `win-unpacked/` (sea la descargada o la generada localmente).
2. **Ejecuta la app:** Haz doble clic en **`Gestor.exe`**.
3. **Inicio automático:**
   * Se abrirá una ventana de bienvenida (*splash screen*).
   * El ejecutable arrancará de forma transparente en segundo plano el servidor Spring Boot y la base de datos embebida H2.
   * En 3 a 5 segundos se abrirá la interfaz de usuario completa. No necesitas configurar servidores, credenciales ni bases de datos externas.

### Requisito del Sistema:
* **Java:** Tener instalado **Java 21** o superior en Windows. Gestor detectará automáticamente el entorno Java del sistema.

### Ubicación de tus Datos:
* Todos tus datos se almacenan exclusivamente en tu propio equipo en un archivo de base de datos local seguro: `%APPDATA%\gestor\database\gestordb.mv.db`. Ni tus cuentas ni tus balances salen nunca de tu ordenador.

---

## 2. Gestión de Carteras

Una **Cartera** representa un contenedor de fondos o una entidad donde guardas dinero o inversiones (por ejemplo: *Banco Santander*, *Binance*, *Broker DeGiro*, *Efectivo*).

* **Crear una Cartera:**
  1. Dirígete a la sección de **Carteras**.
  2. Haz clic en **Nueva Cartera**.
  3. Introduce el nombre (ej. *Cartera Cripto*) y una descripción opcional.
  4. Puedes añadir inmediatamente los activos iniciales que contiene o guardarla vacía para añadirlos más tarde.
* **Consultar una Cartera:**
  * Al hacer clic en una cartera podrás ver su balance total consolidado, la lista de activos que contiene y el historial de cambios.
* **Eliminar una Cartera:**
  * Puedes eliminar una cartera cuando ya no la uses. Recuerda que al eliminarla también se darán de baja sus activos asociados.

---

## 3. Gestión de Activos

Un **Activo** es cualquier bien o moneda con valor económico dentro de una cartera (por ejemplo: *EUR*, *USD*, *Bitcoin*, *Acciones Apple*).

* **Tipos de Activos Disponibles:**
  * Divisas tradicionales (FIAT / Dinero en efectivo o banco).
  * Criptomonedas.
  * Acciones y ETFs.
  * Fondos indexados y Bonos del Tesoro.
  * Otros activos personalizados.
* **Añadir o Editar Activos:**
  1. Entra en la cartera correspondiente.
  2. Pulsa en **Añadir Activo**.
  3. Define el nombre del activo, el tipo y el balance inicial o cantidad actual.
  4. La fecha de adquisición se registrará automáticamente o podrás personalizarla.

---

## 4. Registro de Movimientos y Transferencias

Los **Movimientos** permiten registrar transferencias de dinero entre dos carteras o intercambios entre diferentes activos (por ejemplo: transferir 500 EUR de tu *Cuenta Bancaria* a *Binance* para comprar *BTC*).

* **Cómo registrar un movimiento:**
  1. Ve a la pestaña **Movimientos** o pulsa en **Nueva Transferencia**.
  2. Selecciona la **Cartera Origen** y el **Activo Origen**.
  3. Selecciona la **Cartera Destino** y el **Activo Destino**.
  4. Indica la **Cantidad Origen** enviada y la **Cantidad Destino** recibida.
  5. Confirma la operación. El sistema actualizará automáticamente los balances de ambas carteras y guardará el registro cronológico.

---

---

## 5. Operaciones Recurrentes y Programadas

La sección **Op. Recurrentes** del menú lateral te permite automatizar movimientos periódicos para no tener que introducirlos manualmente:

* **Tipos de Operaciones Soportadas:**
  * **Ingresos recurrentes:** Nóminas periódicas, rendimientos de depósitos o ingresos pasivos hacia una cartera y activo específicos.
  * **Gastos recurrentes:** Pagos fijos, recibos o suscripciones que descuentan automáticamente saldo de una cartera.
  * **Transferencias periódicas:** Automatización de planes de ahorro (DCA) entre dos carteras (por ejemplo, transferir 200 EUR cada mes de tu cuenta bancaria a tu broker).
* **Frecuencias / Intervalos (Timeframes):**
  * Semanal, Quincenal, Mensual, Trimestral o Anual.
* **Ejecución Automática:**
  * Al iniciar la aplicación, el sistema comprueba silenciosamente si existen operaciones programadas cuya fecha haya vencido y las ejecuta automáticamente actualizando los balances y el historial de transacciones.
  * Puedes pausar o reactivar cualquier operación recurrente en cualquier momento sin necesidad de eliminarla.

---

## 6. Dashboard y Métricas

En la pantalla principal (**Dashboard**) encontrarás un resumen ejecutivo de tus finanzas:

* **Patrimonio Total:** La suma total calculada de todas tus carteras activas.
* **Mejores Carteras:** Visualización rápida de las carteras con mayor peso o mejor balance.
* **Evolución Cronológica:** Gráficos para entender cómo ha crecido o variado tu patrimonio a lo largo del tiempo.

---

## 7. Copias de Seguridad (Backups)

Dado que la aplicación guarda todo en un archivo local sin depender de la nube:

* **Hacer una Copia de Seguridad:**
  1. Cierra la aplicación Gestor.
  2. Dirígete a la carpeta donde están tus datos:
     * En Windows: `%APPDATA%\gestor\database\` (es decir, `C:\Users\<TuUsuario>\AppData\Roaming\gestor\database\`).
  3. Copia el archivo `gestordb.mv.db` a una memoria USB, disco externo o tu servicio en la nube preferido (Google Drive, Dropbox, etc.).
* **Restaurar tus Datos:**
  * Basta con copiar tu archivo `gestordb.mv.db` de respaldo en la misma ruta y abrir la aplicación.
