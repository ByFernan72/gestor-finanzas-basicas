# Catálogo de API REST - Endpoints

Base URL local: http://localhost:8080/api/v1

---

## 1. Carteras (/api/v1/cartera)

| Método | Endpoint | Descripción | Payload Request | Respuesta |
|---|---|---|---|---|
| GET | /api/v1/cartera | Listar todas las carteras | Ninguno | List<Cartera> |
| GET | /api/v1/cartera/listado | Listar carteras paginadas con totales y número de activos | Parámetros Pageable | CarteraListadoResponseDto |
| GET | /api/v1/cartera/{id} | Obtener detalle completo de una cartera y sus activos | Ninguno | ObtenerDatosCompletosCarteraRequestDto |
| POST | /api/v1/cartera | Crear una nueva cartera (con o sin activos iniciales) | CrearCarteraRequestDto | Cartera (200 OK) |
| PATCH | /api/v1/cartera/{id}/nombre | Modificar el nombre de una cartera | Query param `nuevoNombreParam` o path variable | 204 No Content |
| PATCH | /api/v1/cartera/{id}/descripcion | Modificar la descripción de una cartera | Query param `nuevaDescripcion` | 204 No Content |
| DELETE | /api/v1/cartera/{id} | Eliminar una cartera | Ninguno | 204 No Content |

---

## 2. Activos (/api/v1/activo)

| Método | Endpoint | Descripción | Payload Request | Respuesta |
|---|---|---|---|---|
| POST | /api/v1/activo | Crear o guardar un activo individual | Activo (JSON) | Activo (200 OK) |
| DELETE | /api/v1/activo/{id} | Eliminar un activo por su ID | Ninguno | 204 No Content |

---

## 3. Movimientos y Transferencias (/api/v1/movimiento)

| Método | Endpoint | Descripción | Payload Request | Respuesta |
|---|---|---|---|---|
| POST | /api/v1/movimiento/transferencia | Ejecutar transferencia segura entre carteras o activos | MovimientoRequestDto | String ("Transferencia realizada con éxito") |
| GET | /api/v1/movimiento/historial/transferencias | Historial paginado de movimientos y transferencias | Parámetros Pageable | Page<TransferenciaDto> |

---

## 4. Dashboard (/api/v1/dashboard)

| Método | Endpoint | Descripción | Payload Request | Respuesta |
|---|---|---|---|---|
| GET | /api/v1/dashboard/resumen | Resumen ejecutivo (patrimonio total, top carteras, últimos movimientos) | Ninguno | DashboardResumenResponseDto |

---

## 5. Historial (/api/v1/historial)

| Método | Endpoint | Descripción | Payload Request | Respuesta |
|---|---|---|---|---|
| POST | /api/v1/historial | Tomar snapshot de saldo actual de todos los activos | Ninguno | 204 No Content |

---

## 6. Perfil (/api/v1/perfil)

| Método | Endpoint | Descripción | Payload Request | Respuesta |
|---|---|---|---|---|
| GET | /api/v1/perfil/{id} | Obtener datos del perfil del usuario | Ninguno | PerfilResponseDto |
| PUT | /api/v1/perfil/{id} | Actualizar nombre y enlaces del perfil | PerfilRequestDto | 204 No Content |

---

## 7. Ajustes (/api/v1/ajustes)

| Método | Endpoint | Descripción | Payload Request | Respuesta |
|---|---|---|---|---|
| POST | /api/v1/ajustes/reset | Resetear completamente la base de datos (carteras, activos, movimientos y perfil) | Ninguno | 204 No Content |

---

---

## 8. Operaciones Programadas y Recurrentes (/api/v1/operacion-programada)

| Método | Endpoint | Descripción | Payload Request | Respuesta |
|---|---|---|---|---|
| POST | /api/v1/operacion-programada/crear-operacion-programada | Crear una nueva regla de operación recurrente | OperacionProgramadaRequest | OperacionProgramada (200 OK) |
| GET | /api/v1/operacion-programada/listado | Listado paginado de operaciones periódicas | Parámetros Pageable (size, page, sort) | Page<OperacionProgramada> |
| PUT | /api/v1/operacion-programada/modificar/{id} | Modificar una operación recurrente existente | OperacionProgramadaRequest | OperacionProgramada (200 OK) |
| PATCH | /api/v1/operacion-programada/{id}/estado | Activar o pausar una operación recurrente | Query param `nuevoEstado` (boolean) | 204 No Content |
| DELETE | /api/v1/operacion-programada/del/{id} | Eliminar una operación programada | Ninguno | 204 No Content |
| POST | /api/v1/operacion-programada/saved/validar | Comprobación y ejecución automática de operaciones pendientes e historial | Ninguno | 204 No Content |

---

## 9. Configuración del Sistema (/api/v1/config)

| Método | Endpoint | Descripción | Payload Request | Respuesta |
|---|---|---|---|---|
| GET | /api/v1/config/{clave} | Obtener valor de configuración interna por su clave | Ninguno | Config (200 OK) |
| POST | /api/v1/config | Crear nueva clave de configuración | Config (JSON) | Config (200 OK) |
| PUT | /api/v1/config/{clave} | Actualizar el valor de una clave | Query param `valor` | Config (200 OK) |

---

## Formato Estándar de Respuestas de Error

Todas las excepciones capturadas por `GlobalExceptionHandler` devuelven el siguiente formato estándar JSON:

```json
{
  "status": 400,
  "mensaje": "Descripción legible del error o validación fallida",
  "timestamp": "2026-09-07T10:45:00"
}
```
