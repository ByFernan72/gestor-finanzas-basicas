import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiMenu, FiChevronLeft, FiChevronRight, FiPlus, FiX, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiSave
} from 'react-icons/fi';
import CustomSelect from '../components/CustomSelect';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api/client';
import {
  OperacionProgramadaDto, OperacionProgramadaRequest, TipoOperacion, TipoTimeFrame, CarteraItemDto, ActivoDetalleDto, CarteraDetalleDto, TipoActivo
} from '../types/api';
import './css/Cartera.css';
import './css/OperacionesRecurrentes.css';

export interface OperacionesProps {
  onMenuClick?: () => void;
}

export default function OperacionesRecurrentes({ onMenuClick }: OperacionesProps): React.JSX.Element {
  const [pagina, setPagina] = useState(0);
  const [operacionesData, setOperacionesData] = useState<any>({ content: [], totalPages: 0, totalElements: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [orden, setOrden] = useState('proximaEjecucion,asc');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  
  const [carteras, setCarteras] = useState<CarteraItemDto[]>([]);
  const [cargandoCarteras, setCargandoCarteras] = useState(false);

  // Activos lists for selected carteras
  const [activosOrigen, setActivosOrigen] = useState<ActivoDetalleDto[]>([]);
  const [activosDestino, setActivosDestino] = useState<ActivoDetalleDto[]>([]);

  const [formCarteraOrigen, setFormCarteraOrigen] = useState<number | ''>('');
  const [formActivoOrigen, setFormActivoOrigen] = useState<number | ''>('');
  const [formCarteraDestino, setFormCarteraDestino] = useState<number | ''>('');
  const [formActivoDestino, setFormActivoDestino] = useState<number | ''>('');
  const [formCantidad, setFormCantidad] = useState<number | ''>('');
  const [formConcepto, setFormConcepto] = useState('');
  const [formTipoOperacion, setFormTipoOperacion] = useState<TipoOperacion>('TRANSFERENCIA');
  const [formTimeFrame, setFormTimeFrame] = useState<TipoTimeFrame>('MENSUAL');
  const [formProximaEjecucion, setFormProximaEjecucion] = useState('');
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [modalConfirmEliminar, setModalConfirmEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  // Modal Crear Activo
  const [modalCrearActivoVisible, setModalCrearActivoVisible] = useState(false);
  const [contextoNuevoActivo, setContextoNuevoActivo] = useState<'ORIGEN'|'DESTINO'|null>(null);
  const [nuevoActivoNombre, setNuevoActivoNombre] = useState('');
  const [nuevoActivoTipo, setNuevoActivoTipo] = useState<TipoActivo>('FIAT');
  const [cargandoNuevoActivo, setCargandoNuevoActivo] = useState(false);

  const handleCrearActivoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idCarteraAfectada = contextoNuevoActivo === 'ORIGEN' ? formCarteraOrigen : formCarteraDestino;
    if (!idCarteraAfectada) return;

    try {
      setCargandoNuevoActivo(true);
      const res = await api.post('/activo', {
        idCartera: Number(idCarteraAfectada),
        nombreActivo: nuevoActivoNombre,
        tipoActivo: nuevoActivoTipo,
        balance: 0,
        fechaObtencionActivo: new Date().toISOString()
      });
      
      await fetchActivos(Number(idCarteraAfectada), contextoNuevoActivo === 'ORIGEN');
      
      if (contextoNuevoActivo === 'ORIGEN') {
        setFormActivoOrigen(res.data.idActivo);
      } else {
        setFormActivoDestino(res.data.idActivo);
      }

      setModalCrearActivoVisible(false);
      setNuevoActivoNombre('');
      setNuevoActivoTipo('FIAT');
    } catch (err) {
      console.error('Error creando activo:', err);
      alert('No se pudo crear el activo');
    } finally {
      setCargandoNuevoActivo(false);
    }
  };


  const traerOperaciones = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await api.get(`/operacion-programada/listado?page=${pagina}&size=10&sort=${orden}`);
      setOperacionesData(respuesta.data);
    } catch (err) {
      console.error('Error al obtener operaciones:', err);
      setError('No se pudieron cargar las operaciones programadas.');
    } finally {
      setCargando(false);
    }
  }, [pagina, orden]);

  const traerCarteras = async () => {
    try {
      setCargandoCarteras(true);
      const res = await api.get(`/cartera/listado?page=0&size=100`);
      if (res.data && res.data.carteras) {
        setCarteras(res.data.carteras);
      }
    } catch (err) {
      console.error('Error al cargar carteras', err);
    } finally {
      setCargandoCarteras(false);
    }
  };

  const fetchActivos = async (idCartera: number, isOrigen: boolean) => {
    try {
      const res = await api.get<CarteraDetalleDto>(`/cartera/${idCartera}`);
      if (res.data && res.data.activos) {
        if (isOrigen) setActivosOrigen(res.data.activos);
        else setActivosDestino(res.data.activos);
      }
    } catch (err) {
      console.error('Error al cargar activos de la cartera', idCartera, err);
      if (isOrigen) setActivosOrigen([]);
      else setActivosDestino([]);
    }
  };

  // When formCarteraOrigen changes, fetch its active assets
  useEffect(() => {
    if (formCarteraOrigen) {
      fetchActivos(Number(formCarteraOrigen), true);
    } else {
      setActivosOrigen([]);
      setFormActivoOrigen('');
    }
  }, [formCarteraOrigen]);

  // When formCarteraDestino changes, fetch its active assets
  useEffect(() => {
    if (formCarteraDestino) {
      fetchActivos(Number(formCarteraDestino), false);
    } else {
      setActivosDestino([]);
      setFormActivoDestino('');
    }
  }, [formCarteraDestino]);

  useEffect(() => {
    traerOperaciones();
  }, [traerOperaciones]);

  useEffect(() => {
    if (modalAbierto && carteras.length === 0) {
      traerCarteras();
    }
  }, [modalAbierto, carteras.length]);

  const toggleEstado = async (id: number, estadoActual: boolean) => {
    try {
      await api.patch(`/operacion-programada/${id}/estado?nuevoEstado=${!estadoActual}`);
      traerOperaciones();
    } catch (err) {
      console.error('Error cambiando estado:', err);
    }
  };

  const abrirModalCrear = () => {
    setEditandoId(null);
    setFormCarteraOrigen('');
    setFormActivoOrigen('');
    setFormCarteraDestino('');
    setFormActivoDestino('');
    setFormCantidad('');
    setFormConcepto('');
    setFormTipoOperacion('TRANSFERENCIA');
    setFormTimeFrame('MENSUAL');
    setFormProximaEjecucion(new Date().toISOString().substring(0, 16));
    setErrorForm(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (op: OperacionProgramadaDto) => {
    setEditandoId(op.idOperacion);
    setFormCarteraOrigen(op.idCarteraOrigen || '');
    setFormActivoOrigen(op.idActivoOrigen || '');
    setFormCarteraDestino(op.idCarteraDestino || '');
    setFormActivoDestino(op.idActivoDestino || '');
    setFormCantidad(op.cantidad || '');
    setFormConcepto(op.concepto || '');
    setFormTipoOperacion(op.tipoOperacion || 'TRANSFERENCIA');
    setFormTimeFrame(op.tipoTimeFrame || 'MENSUAL');
    setFormProximaEjecucion(op.proximaEjecucion ? op.proximaEjecucion.substring(0, 16) : '');
    setErrorForm(null);
    setModalAbierto(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCarteraDestino || !formActivoDestino || !formCantidad || !formProximaEjecucion) {
      setErrorForm('Por favor, completa los campos obligatorios del destino.');
      return;
    }
    if (formTipoOperacion === 'TRANSFERENCIA' && (!formCarteraOrigen || !formActivoOrigen)) {
      setErrorForm('La cartera y activo de origen son obligatorios para una transferencia.');
      return;
    }
    
    const request: OperacionProgramadaRequest = {
      idCarteraOrigen: formCarteraOrigen ? Number(formCarteraOrigen) : undefined,
      idActivoOrigen: formActivoOrigen ? Number(formActivoOrigen) : undefined,
      idCarteraDestino: Number(formCarteraDestino),
      idActivoDestino: Number(formActivoDestino),
      cantidad: Number(formCantidad),
      tipoOperacion: formTipoOperacion,
      concepto: formConcepto,
      tipoTimeFrame: formTimeFrame,
      proximaEjecucion: new Date(formProximaEjecucion).toISOString(),
    };

    try {
      if (editandoId) {
        await api.put(`/operacion-programada/modificar/${editandoId}`, request);
      } else {
        await api.post(`/operacion-programada/crear-operacion-programada`, request);
      }
      setModalAbierto(false);
      traerOperaciones();
    } catch (err: any) {
      console.error(`Error guardando:`, err);
      setErrorForm(err.response?.data?.message || `Ocurrió un error al guardar la operación.`);
    }
  };

  const confirmarEliminar = (id: number) => {
    setIdAEliminar(id);
    setModalConfirmEliminar(true);
  };

  const ejecutarEliminar = async () => {
    if (!idAEliminar) return;
    try {
      await api.delete(`/operacion-programada/del/${idAEliminar}`);
      setModalConfirmEliminar(false);
      setIdAEliminar(null);
      traerOperaciones();
    } catch (err) {
      console.error('Error al eliminar', err);
    }
  };

  const opsRaw: OperacionProgramadaDto[] = operacionesData.content || [];
  
  const opsFiltradas = useMemo(() => {
    return opsRaw.filter(op => {
      const matchTexto = !busqueda.trim() || op.concepto?.toLowerCase().includes(busqueda.toLowerCase());
      let matchEstado = true;
      if (filtroEstado === `ACTIVO`) matchEstado = op.isActive === true;
      if (filtroEstado === `PAUSADO`) matchEstado = op.isActive === false;
      return matchTexto && matchEstado;
    });
  }, [opsRaw, busqueda, filtroEstado]);

  const getNombreCartera = (id?: number) => {
    if (!id) return 'N/A';
    const c = carteras.find(x => x.idCartera === id);
    return c ? c.nombreCartera : `ID: ${id}`;
  };

  return (
    <main className="main-content">
      {onMenuClick && (
        <button className="hamburger-btn" onClick={onMenuClick}>
          <FiMenu />
        </button>
      )}

      <div className="carteras-widget op-widget">
        <div className="carteras-widget-header op-header">
          <div className="op-header-title">
            <h2>Operaciones Recurrentes</h2>
            <p className="op-subtitle">Programa transferencias, ingresos o gastos periódicos</p>
          </div>

          <div className="op-header-actions">
            <div className="search-box header-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por concepto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
              />
              {busqueda && (
                <button type="button" className="clear-search-btn" onClick={() => setBusqueda('')}>
                  <FiX />
                </button>
              )}
            </div>

            <div className="filter-group">
              <CustomSelect
                options={[
                  { value: 'TODOS', label: 'Todos los estados' },
                  { value: 'ACTIVO', label: 'Activas' },
                  { value: 'PAUSADO', label: 'Pausadas' },
                ]}
                value={filtroEstado}
                onChange={(v) => setFiltroEstado(String(v))}
              />
            </div>
            
            <div className="filter-group">
              <CustomSelect
                options={[
                  { value: 'proximaEjecucion,asc', label: 'Ejecución: Más próxima' },
                  { value: 'proximaEjecucion,desc', label: 'Ejecución: Más lejana' },
                  { value: 'cantidad,desc', label: 'Cantidad: Mayor' },
                  { value: 'cantidad,asc', label: 'Cantidad: Menor' },
                ]}
                value={orden}
                onChange={(v) => { setOrden(String(v)); setPagina(0); }}
              />
            </div>

            <button type="button" className="btn-primary" onClick={abrirModalCrear}>
              <FiPlus /> Nueva Operación
            </button>
          </div>
        </div>

        <div className="carteras-widget-body">
          {cargando && opsRaw.length === 0 ? (
            <div className="op-loading">
              <FiRefreshCw className="spin" style={{ fontSize: '2rem', marginBottom: '12px' }} />
              <p>Cargando operaciones recurrentes...</p>
            </div>
          ) : error ? (
            <div className="op-error">
              <p>⚠️ {error}</p>
              <button type="button" className="btn-primary" onClick={traerOperaciones}>Reintentar</button>
            </div>
          ) : opsFiltradas.length === 0 ? (
            <div className="op-empty">
              <p>No se encontraron operaciones programadas {busqueda ? 'con los filtros actuales.' : '.'}</p>
            </div>
          ) : (
            <div className="op-grid">
              {opsFiltradas.map((op) => (
                <div key={op.idOperacion} className="op-card">
                  <div>
                    <div className="op-card-header">
                      <h3 className="op-title">
                        {op.concepto || op.tipoOperacion}
                        <span className="op-badge-type">{op.tipoTimeFrame}</span>
                      </h3>
                      <div className="op-actions">
                        <button onClick={() => abrirModalEditar(op)} title="Editar"><FiEdit2 /></button>
                        <button onClick={() => confirmarEliminar(op.idOperacion)} className="btn-delete" title="Eliminar"><FiTrash2 /></button>
                      </div>
                    </div>
                    
                    <div className="op-card-body">
                      <div className="op-detail-row">
                        <span className="op-detail-label">Origen ➔ Destino:</span>
                        <span className="op-detail-value" title={`Origen: C=${op.idCarteraOrigen || 'N/A'} A=${op.idActivoOrigen || 'N/A'} Destino: C=${op.idCarteraDestino} A=${op.idActivoDestino}`}>
                           {op.tipoOperacion === 'INGRESO' ? 'Externo' : getNombreCartera(op.idCarteraOrigen)} ➔ {getNombreCartera(op.idCarteraDestino)}
                        </span>
                      </div>
                      <div className="op-detail-row">
                        <span className="op-detail-label">Próxima ejecución:</span>
                        <span className="op-detail-value">
                          {op.proximaEjecucion ? new Date(op.proximaEjecucion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : '-'}
                        </span>
                      </div>
                      <div className="op-detail-row" style={{ marginTop: '8px' }}>
                        <span className="op-amount">
                          {op.tipoOperacion === 'GASTO' ? '-' : '+'}{(op.cantidad || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="op-card-footer">
                    <div className="op-toggle-wrapper">
                      <label className="op-switch">
                        <input 
                          type="checkbox" 
                          checked={op.isActive} 
                          onChange={() => toggleEstado(op.idOperacion, op.isActive)}
                        />
                        <span className="op-slider"></span>
                      </label>
                      <span>{op.isActive ? 'Activa' : 'Pausada'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="carteras-widget-footer">
          <span>Página {pagina + 1} de {operacionesData.totalPages || 1}</span>
          <div className="carteras-pagination">
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setPagina(p => Math.max(0, p - 1))}
              disabled={pagina === 0 || cargando}
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setPagina(p => p + 1)}
              disabled={pagina >= (operacionesData.totalPages - 1) || cargando}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>{editandoId ? 'Editar Operación Recurrente' : 'Nueva Operación Recurrente'}</h3>
              <button className="close-btn" onClick={() => setModalAbierto(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              {errorForm && <p className="modal-error">⚠️ {errorForm}</p>}
              <form onSubmit={handleGuardar}>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Concepto</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      value={formConcepto} 
                      onChange={e => setFormConcepto(e.target.value)}
                      placeholder="Ej. Pago de alquiler..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Tipo de Operación</label>
                    <CustomSelect
                      options={[
                        { value: 'TRANSFERENCIA', label: 'Transferencia' },
                        { value: 'INGRESO', label: 'Ingreso' },
                        { value: 'GASTO', label: 'Gasto' }
                      ]}
                      value={formTipoOperacion}
                      onChange={v => setFormTipoOperacion(v as TipoOperacion)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Frecuencia</label>
                    <CustomSelect
                      options={[
                        { value: 'SEMANAL', label: 'Semanal' },
                        { value: 'QUINCENAL', label: 'Quincenal' },
                        { value: 'MENSUAL', label: 'Mensual' },
                        { value: 'TRIMESTRAL', label: 'Trimestral' },
                        { value: 'ANUAL', label: 'Anual' }
                      ]}
                      value={formTimeFrame}
                      onChange={v => setFormTimeFrame(v as TipoTimeFrame)}
                    />
                  </div>

                  <div style={{ 
                    gridColumn: '1 / -1', 
                    display: 'flex', 
                    gap: '16px',
                    width: '100%' 
                  }}>
                    <div style={{
                      flex: formTipoOperacion === 'TRANSFERENCIA' ? 1 : 0,
                      opacity: formTipoOperacion === 'TRANSFERENCIA' ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      visibility: formTipoOperacion === 'TRANSFERENCIA' ? 'visible' : 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      <div className="form-group" style={{ minWidth: '250px' }}>
                        <label>Cartera Origen</label>
                        <CustomSelect
                          options={carteras.map(c => ({ value: c.idCartera, label: c.nombreCartera }))}
                          value={formCarteraOrigen.toString()}
                          onChange={v => setFormCarteraOrigen(v ? Number(v) : '')}
                          disabled={cargandoCarteras}
                          placeholder="Seleccione cartera origen..."
                        />
                      </div>
                      <div className="form-group" style={{ minWidth: '250px' }}>
                        <label>Activo Origen</label>
                        <CustomSelect
                          options={[...activosOrigen.map(a => ({ value: a.idActivo || '', label: a.nombreActivo })), { value: 'NUEVO_ACTIVO', label: '+ Crear nuevo activo...' }]}
                          value={formActivoOrigen.toString()}
                          onChange={v => {
                            if (v === 'NUEVO_ACTIVO') {
                              setContextoNuevoActivo('ORIGEN');
                              setModalCrearActivoVisible(true);
                            } else {
                              setFormActivoOrigen(v ? Number(v) : '');
                            }
                          }}
                          disabled={!formCarteraOrigen}
                          placeholder="Seleccione activo..."
                        />
                      </div>
                    </div>

                    <div style={{
                      flex: 1,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      <div className="form-group">
                        <label>{formTipoOperacion === 'TRANSFERENCIA' ? 'Cartera Destino' : 'Cartera Afectada'}</label>
                        <CustomSelect
                          options={carteras.map(c => ({ value: c.idCartera, label: c.nombreCartera }))}
                          value={formCarteraDestino.toString()}
                          onChange={v => setFormCarteraDestino(v ? Number(v) : '')}
                          disabled={cargandoCarteras}
                          placeholder={formTipoOperacion === 'TRANSFERENCIA' ? 'Seleccione destino...' : 'Seleccione cartera...'}
                        />
                      </div>
                      <div className="form-group">
                        <label>Activo {formTipoOperacion === 'TRANSFERENCIA' ? 'Destino' : 'Afectado'}</label>
                        <CustomSelect
                          options={[...activosDestino.map(a => ({ value: a.idActivo || '', label: a.nombreActivo })), { value: 'NUEVO_ACTIVO', label: '+ Crear nuevo activo...' }]}
                          value={formActivoDestino.toString()}
                          onChange={v => {
                            if (v === 'NUEVO_ACTIVO') {
                              setContextoNuevoActivo('DESTINO');
                              setModalCrearActivoVisible(true);
                            } else {
                              setFormActivoDestino(v ? Number(v) : '');
                            }
                          }}
                          disabled={!formCarteraDestino}
                          placeholder="Seleccione activo..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Cantidad (€)</label>
                    <input 
                      type="number" 
                      step="any" 
                      min="0.01" 
                      className="modal-input" 
                      value={formCantidad.toString()} 
                      onChange={e => setFormCantidad(e.target.value ? Number(e.target.value) : '')}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Próxima Ejecución</label>
                    <input 
                      type="datetime-local" 
                      className="modal-input" 
                      value={formProximaEjecucion} 
                      onChange={e => setFormProximaEjecucion(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary"><FiSave /> Guardar Operación</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {modalConfirmEliminar && (
        <ConfirmModal
          isOpen={modalConfirmEliminar}
          title="Eliminar Operación"
          message="¿Estás seguro de que deseas eliminar esta operación recurrente? Esta acción no se puede deshacer."
          onConfirm={ejecutarEliminar}
          onCancel={() => {
            setModalConfirmEliminar(false);
            setIdAEliminar(null);
          }}
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
          variant="danger"
        />
      )}
    
      {modalCrearActivoVisible && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-container" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Crear Nuevo Activo</h3>
              <button type="button" className="close-btn" onClick={() => setModalCrearActivoVisible(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCrearActivoSubmit}>
                <div className="form-group">
                  <label>Nombre del Activo</label>
                  <input 
                    type="text" 
                    className="modal-input" 
                    value={nuevoActivoNombre} 
                    onChange={e => setNuevoActivoNombre(e.target.value)}
                    required
                    placeholder="Ej: Cuenta Ahorro, BTC..."
                  />
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Tipo de Activo</label>
                  <CustomSelect
                    options={[
                      { value: 'FIAT', label: 'Fiat' },
                      { value: 'ACCION', label: 'Acción' },
                      { value: 'ETF', label: 'ETF' },
                      { value: 'CRYPTO', label: 'Crypto' },
                      { value: 'FONDO_INDEXADO', label: 'Fondo' },
                      { value: 'BONOS_TESORO', label: 'Bonos' },
                      { value: 'OTHER', label: 'Otro' }
                    ]}
                    value={nuevoActivoTipo}
                    onChange={v => setNuevoActivoTipo(v as TipoActivo)}
                  />
                </div>
                <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setModalCrearActivoVisible(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary" disabled={cargandoNuevoActivo}>
                    {cargandoNuevoActivo ? 'Guardando...' : 'Crear Activo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
