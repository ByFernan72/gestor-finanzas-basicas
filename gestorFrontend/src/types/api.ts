export type TipoActivo = 'FIAT' | 'CRYPTO' | 'FONDO_INDEXADO' | 'BONOS_TESORO' | 'ETF' | 'ACCION' | 'OTHER';

export interface CarteraTopDto {
  idCartera: number;
  nombreCartera: string;
  totalCartera: number;
}

export interface MovimientoResumenDto {
  id?: number;
  idMovimiento?: number;
  carteraOrigen: string;
  activo: string;
  enviado: number;
  carteraDestino: string;
  activoRecibido: string;
  recibido: number;
  fechaMovimiento?: string;
}

export interface DashboardResumenResponseDto {
  balanceTotal: number;
  carteras: CarteraTopDto[];
  movimientos: MovimientoResumenDto[];
}

export interface CarteraItemDto {
  idCartera: number;
  nombreCartera: string;
  descripcion?: string;
  totalCartera: number;
  totalActivosCartera: number;
}

export interface CarteraListadoResponseDto {
  carteras: CarteraItemDto[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
}

export interface ActivoDetalleDto {
  idActivo?: number;
  nombreActivo: string;
  tipoActivo?: TipoActivo;
  tipo?: TipoActivo;
  balance: number;
  fechaObtencionActivo?: string;
}

export interface CarteraDetalleDto {
  idCartera: number;
  nombreCartera: string;
  descripcion?: string;
  createdAt?: string;
  activos: ActivoDetalleDto[];
}

export interface PerfilResponseDto {
  idPerfil: number;
  nombrePerfil: string;
  links: string[];
  fechaCreacionPerfil?: string;
}

export interface CrearActivoPayload {
  nombreActivo: string;
  tipo: TipoActivo;
  balance: number;
}

export interface CrearCarteraPayload {
  nombreCartera: string;
  descripcion?: string;
  activos: CrearActivoPayload[];
}

export interface MovimientoPayload {
  idCarteraOrigen: number;
  idCarteraDestino: number;
  idActivoOrigen: number;
  idActivoDestino?: number | null;
  cantidadOrigen: number;
  cantidadDestino: number;
  nombreNuevoActivo?: string | null;
  tipoNuevoActivo?: TipoActivo | null;
}

export interface ApiErrorResponse {
  mensaje?: string;
  message?: string;
  codigo?: string | number;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size?: number;
  first?: boolean;
  last?: boolean;
}

export interface DraftActivo {
  id: string | number;
  nombreActivo: string;
  tipo: TipoActivo;
  balance: string | number;
}

export interface ActualizarActivoPayload {
  idActivo: number;
  idCartera: number;
  nombreActivo: string;
  tipoActivo: TipoActivo;
  balance: number;
  fechaObtencionActivo?: string;
}

export type TipoOperacion = 'INGRESO' | 'TRANSFERENCIA' | 'GASTO';
export type TipoTimeFrame = 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL';

export interface OperacionProgramadaDto {
  idOperacion: number;
  idCarteraOrigen?: number;
  idCarteraDestino: number;
  idActivoOrigen?: number;
  idActivoDestino: number;
  cantidad: number;
  tipoOperacion: TipoOperacion;
  concepto?: string;
  tipoTimeFrame: TipoTimeFrame;
  proximaEjecucion: string;
  isActive: boolean;
  createdAt?: string;
}

export interface OperacionProgramadaRequest {
  idCarteraOrigen?: number;
  idCarteraDestino: number;
  idActivoOrigen?: number;
  idActivoDestino: number;
  cantidad: number;
  tipoOperacion: TipoOperacion;
  concepto?: string;
  tipoTimeFrame: TipoTimeFrame;
  proximaEjecucion: string;
}
