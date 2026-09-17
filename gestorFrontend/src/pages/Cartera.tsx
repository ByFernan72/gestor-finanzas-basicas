import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiX,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiCheck,
  FiSearch,
  FiRefreshCw,
} from 'react-icons/fi';
import Footer from '../components/Footer';
import CustomSelect from '../components/CustomSelect';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api/client';
import {
  CarteraItemDto,
  CarteraDetalleDto,
  ActivoDetalleDto,
  TipoActivo,
  CarteraListadoResponseDto,
} from '../types/api';
import './css/Cartera.css';

export interface CarteraProps {
  onMenuClick?: () => void;
}

export default function Cartera({ onMenuClick }: CarteraProps): React.JSX.Element {
  const navigate = useNavigate();
  const [pagina, setPagina] = useState(0);
  const [ordenCarteras, setOrdenCarteras] = useState('nombreCartera,asc');
  const [busquedaCartera, setBusquedaCartera] = useState('');
  const [carterasData, setCarterasData] = useState<CarteraListadoResponseDto>({
    carteras: [],
    paginaActual: 0,
    totalPaginas: 0,
    totalElementos: 0,
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el detalle/modal de cartera
  const [carteraSeleccionada, setCarteraSeleccionada] = useState<CarteraDetalleDto | null>(null);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);

  // Filtros y ordenación de activos en modal
  const [ordenActivos, setOrdenActivos] = useState('balance,desc');
  const [filtroTipoActivo, setFiltroTipoActivo] = useState('TODOS');

  // Estados de edición de la cartera
  const [nombreEdit, setNombreEdit] = useState('');
  const [descripcionEdit, setDescripcionEdit] = useState('');

  // Lista de activos de la cartera seleccionada
  const [activosEdit, setActivosEdit] = useState<ActivoDetalleDto[]>([]);

  // Estado para edición inline de activos
  const [activoEditandoId, setActivoEditandoId] = useState<number | null>(null);
  const [activoNombreEdit, setActivoNombreEdit] = useState('');
  const [activoTipoEdit, setActivoTipoEdit] = useState<TipoActivo>('FIAT');
  const [activoBalanceEdit, setActivoBalanceEdit] = useState<string | number>('');
  const [activoFechaEdit, setActivoFechaEdit] = useState('');

  // Estado para añadir un nuevo activo temporalmente
  const [mostrandoNuevoActivo, setMostrandoNuevoActivo] = useState(false);
  const [nuevoActivoNombre, setNuevoActivoNombre] = useState('');
  const [nuevoActivoTipo, setNuevoActivoTipo] = useState<TipoActivo>('FIAT');
  const [nuevoActivoBalance, setNuevoActivoBalance] = useState('');
  const [nuevoActivoFecha, setNuevoActivoFecha] = useState(new Date().toISOString().substring(0, 16));

  // Estados para modales de confirmación destructiva
  const [modalConfirmCartera, setModalConfirmCartera] = useState(false);
  const [activoAEliminar, setActivoAEliminar] = useState<ActivoDetalleDto | null>(null);
  const [eliminandoProceso, setEliminandoProceso] = useState(false);

  const traerCarteras = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await api.get<CarteraListadoResponseDto>(
        `/cartera/listado?page=${pagina}&size=10&sort=${ordenCarteras}`
      );
      setCarterasData(
        respuesta.data || { carteras: [], paginaActual: 0, totalPaginas: 0, totalElementos: 0 }
      );
    } catch (err) {
      console.error('Error al conectar con Spring Boot:', err);
      setError('No se pudo sincronizar el cuadro de mando financiero.');
    } finally {
      setCargando(false);
    }
  }, [pagina, ordenCarteras]);

  useEffect(() => {
    traerCarteras();
  }, [traerCarteras]);

  // Bloquear el scroll de fondo cuando el modal de la cartera está abierto
  useEffect(() => {
    if (carteraSeleccionada) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [carteraSeleccionada]);

  // Cargar activos con ordenación del backend
  const traerDetalleCartera = async (idCartera: number, sortCriteria = ordenActivos) => {
    try {
      setErrorDetalle(null);
      const respuesta = await api.get<CarteraDetalleDto>(`/cartera/${idCartera}?sort=${sortCriteria}`);
      if (respuesta && respuesta.data) {
        setCarteraSeleccionada(respuesta.data);
        setNombreEdit(respuesta.data.nombreCartera || '');
        setDescripcionEdit(respuesta.data.descripcion || '');
        setActivosEdit(respuesta.data.activos || []);
      }
    } catch (err) {
      console.error('Error al obtener detalle de la cartera:', err);
      setErrorDetalle('No se pudo obtener el detalle de los activos.');
    }
  };

  // Abrir detalle de cartera inmediatamente
  const abrirCartera = (cartera: CarteraItemDto) => {
    const detalleInicial: CarteraDetalleDto = {
      idCartera: cartera.idCartera,
      nombreCartera: cartera.nombreCartera,
      descripcion: cartera.descripcion,
      activos: [],
    };
    setCarteraSeleccionada(detalleInicial);
    setNombreEdit(cartera.nombreCartera || '');
    setDescripcionEdit(cartera.descripcion || '');
    setActivosEdit([]);
    setMostrandoNuevoActivo(false);
    setActivoEditandoId(null);
    setFiltroTipoActivo('TODOS');
    traerDetalleCartera(cartera.idCartera, ordenActivos);
  };

  const handleCambioOrdenActivos = async (nuevoSort: string) => {
    setOrdenActivos(nuevoSort);
    if (carteraSeleccionada?.idCartera) {
      await traerDetalleCartera(carteraSeleccionada.idCartera, nuevoSort);
    }
  };

  // Guardar cambios generales de la cartera (nombre, descripción)
  const handleGuardarCartera = async () => {
    if (!carteraSeleccionada) return;
    if (!nombreEdit.trim()) {
      setErrorDetalle('El nombre de la cartera es obligatorio.');
      return;
    }
    if (nombreEdit.trim().length > 100) {
      setErrorDetalle(`El nombre de la cartera supera el máximo permitido (máx. 100 caracteres, actual: ${nombreEdit.trim().length}).`);
      return;
    }
    if (descripcionEdit.trim().length > 500) {
      setErrorDetalle(`La descripción supera el máximo permitido (máx. 500 caracteres, actual: ${descripcionEdit.trim().length}).`);
      return;
    }
    setErrorDetalle(null);
    try {
      await api.patch(
        `/cartera/${carteraSeleccionada.idCartera}/${encodeURIComponent(nombreEdit.trim())}?nuevoNombreParam=${encodeURIComponent(nombreEdit.trim())}`
      );
      await api.patch(
        `/cartera/${carteraSeleccionada.idCartera}/descripcion?nuevaDescripcion=${encodeURIComponent(descripcionEdit.trim())}`
      );

      await traerCarteras();
      setCarteraSeleccionada(null);
    } catch (err: any) {
      console.error('Error al guardar cambios de la cartera:', err);
      const serverMsg =
        err?.response?.data?.nuevaDescripcion ||
        err?.response?.data?.nuevoNombre ||
        err?.response?.data?.mensaje ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null);

      setErrorDetalle(serverMsg || 'No se pudieron guardar los cambios de la cartera. Verifica que la descripción no supere los 500 caracteres.');
    }
  };

  // Confirmar y eliminar la cartera completa
  const ejecutarEliminarCartera = async () => {
    if (!carteraSeleccionada) return;
    try {
      setEliminandoProceso(true);
      await api.delete(`/cartera/${carteraSeleccionada.idCartera}`);
      setModalConfirmCartera(false);
      setCarteraSeleccionada(null);
      await traerCarteras();
    } catch (err) {
      console.error('Error al eliminar la cartera:', err);
      setErrorDetalle('No se pudo eliminar la cartera.');
      setModalConfirmCartera(false);
    } finally {
      setEliminandoProceso(false);
    }
  };

  // Activar edición de un activo
  const iniciarEdicionActivo = (activo: ActivoDetalleDto) => {
    setActivoEditandoId(activo.idActivo ?? null);
    setActivoNombreEdit(activo.nombreActivo || '');
    setActivoTipoEdit(activo.tipoActivo || activo.tipo || 'FIAT');
    setActivoBalanceEdit(activo.balance ?? '');
    setActivoFechaEdit(activo.fechaObtencionActivo ? activo.fechaObtencionActivo.substring(0, 16) : '');
  };

  // Cancelar edición de un activo
  const cancelarEdicionActivo = () => {
    setActivoEditandoId(null);
  };

  // Guardar activo editado
  const handleGuardarActivo = async (idActivo: number) => {
    if (!carteraSeleccionada) return;
    if (!activoNombreEdit.trim()) {
      setErrorDetalle('El nombre del activo es obligatorio.');
      return;
    }
    try {
      const balanceNum = parseFloat(String(activoBalanceEdit).replace(',', '.')) || 0;
      const payload = {
        idActivo: idActivo,
        idCartera: carteraSeleccionada.idCartera,
        nombreActivo: activoNombreEdit.trim(),
        tipoActivo: activoTipoEdit,
        balance: balanceNum,
        fechaObtencionActivo: activoFechaEdit ? new Date(activoFechaEdit).toISOString() : new Date().toISOString(),
      };

      await api.put(`/activo/${idActivo}`, payload).catch(() => null);

      setActivosEdit((prev) =>
        prev.map((act) => (act.idActivo === idActivo ? { ...act, ...payload } : act))
      );
      setActivoEditandoId(null);
      traerCarteras();
    } catch (err) {
      console.error('Error al actualizar el activo:', err);
      setErrorDetalle('No se pudo actualizar el activo.');
    }
  };

  // Confirmar y eliminar activo
  const ejecutarEliminarActivo = async () => {
    if (!activoAEliminar || !activoAEliminar.idActivo) return;
    try {
      setEliminandoProceso(true);
      const idActivo = activoAEliminar.idActivo;
      await api.delete(`/activo/${idActivo}`);
      setActivosEdit((prev) => prev.filter((act) => act.idActivo !== idActivo));
      setActivoAEliminar(null);
      traerCarteras();
    } catch (err) {
      console.error('Error al eliminar el activo:', err);
      setErrorDetalle('No se pudo eliminar el activo.');
      setActivoAEliminar(null);
    } finally {
      setEliminandoProceso(false);
    }
  };

  // Guardar nuevo activo
  const handleCrearActivo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carteraSeleccionada) return;
    if (!nuevoActivoNombre.trim()) {
      setErrorDetalle('El nombre del activo es obligatorio.');
      return;
    }
    try {
      const payload = {
        idCartera: carteraSeleccionada.idCartera,
        nombreActivo: nuevoActivoNombre.trim(),
        tipoActivo: nuevoActivoTipo,
        balance: parseFloat(String(nuevoActivoBalance).replace(',', '.')) || 0,
        fechaObtencionActivo: nuevoActivoFecha ? new Date(nuevoActivoFecha).toISOString() : new Date().toISOString(),
      };

      const respuesta = await api.post<ActivoDetalleDto>('/activo', payload);

      if (respuesta && respuesta.data) {
        setActivosEdit((prev) => [...prev, respuesta.data]);
      } else {
        setActivosEdit((prev) => [...prev, { idActivo: Date.now(), ...payload }]);
      }

      setNuevoActivoNombre('');
      setNuevoActivoTipo('FIAT');
      setNuevoActivoBalance('');
      setNuevoActivoFecha(new Date().toISOString().substring(0, 16));
      setMostrandoNuevoActivo(false);
      traerCarteras();
    } catch (err) {
      console.error('Error al añadir el activo:', err);
      setErrorDetalle('No se pudo añadir el activo.');
    }
  };

  // Filtrado de activos en modal por tipo
  const activosFiltrados = useMemo(() => {
    if (filtroTipoActivo === 'TODOS') return activosEdit;
    return activosEdit.filter((a) => (a.tipoActivo || a.tipo) === filtroTipoActivo);
  }, [activosEdit, filtroTipoActivo]);

  const {
    carteras = [],
    totalPaginas = 0,
    totalElementos = 0,
  } = carterasData;

  // Filtrado client-side por texto de búsqueda en carteras
  const carterasVisualizadas = useMemo(() => {
    if (!busquedaCartera.trim()) return carteras;
    const term = busquedaCartera.toLowerCase();
    return carteras.filter(
      (c) =>
        c.nombreCartera?.toLowerCase().includes(term) ||
        c.descripcion?.toLowerCase().includes(term)
    );
  }, [carteras, busquedaCartera]);

  return (
    <main className="main-content">
      {onMenuClick && (
        <button className="hamburger-btn" onClick={onMenuClick} aria-label="Abrir menú">
          <FiMenu />
        </button>
      )}

      <div className="carteras-widget">
        <div className="carteras-widget-header">
          <div className="carteras-header-title">
            <h2>Gestión de Carteras</h2>
            <p className="carteras-subtitle">Administra tus carteras de inversión y activos financieros</p>
          </div>

          <div className="carteras-header-actions">
            <div className="search-box header-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar cartera..."
                value={busquedaCartera}
                onChange={(e) => setBusquedaCartera(e.target.value)}
                className="search-input"
              />
              {busquedaCartera && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setBusquedaCartera('')}
                  title="Limpiar búsqueda"
                >
                  <FiX />
                </button>
              )}
            </div>

            <div className="filter-group header-filter">
              <CustomSelect
                className="header-custom-select"
                options={[
                  { value: 'nombreCartera,asc', label: 'Nombre (A - Z)' },
                  { value: 'nombreCartera,desc', label: 'Nombre (Z - A)' },
                  { value: 'totalCartera,desc', label: 'Mayor Balance' },
                  { value: 'totalCartera,asc', label: 'Menor Balance' },
                ]}
                value={ordenCarteras}
                onChange={(val) => {
                  setPagina(0);
                  setOrdenCarteras(String(val));
                }}
              />
            </div>

            <button
              type="button"
              className="btn-primary btn-new-cartera"
              onClick={() => navigate('/cartera/nueva')}
            >
              <FiPlus style={{ fontSize: '1.2rem' }} />
              Nueva Cartera
            </button>
          </div>
        </div>

        <div className="carteras-widget-body">
          {cargando && carteras.length === 0 ? (
            <div className="carteras-loading">
              <FiRefreshCw className="spin" style={{ fontSize: '2rem', marginBottom: '12px' }} />
              <p>Cargando carteras...</p>
            </div>
          ) : error ? (
            <div className="carteras-error">
              <p>⚠️ {error}</p>
              <button
                type="button"
                className="btn-primary"
                onClick={traerCarteras}
                style={{ marginTop: '12px' }}
              >
                Reintentar
              </button>
            </div>
          ) : carterasVisualizadas.length === 0 ? (
            <div className="carteras-empty">
              <p>No se encontraron carteras {busquedaCartera ? 'con el filtro aplicado.' : 'registradas.'}</p>
            </div>
          ) : (
            <div className="cartera-grid">
              {carterasVisualizadas.map((cartera) => (
                <div
                  key={cartera.idCartera}
                  className="cartera-card clickable-card"
                  onClick={() => abrirCartera(cartera)}
                  style={{ cursor: 'pointer' }}
                  title="Haz clic para ver detalles y gestionar activos"
                >
                  <div className="cartera-card-left">
                    <h3 className="cartera-title">{cartera.nombreCartera}</h3>
                    <p className="cartera-description">{cartera.descripcion || ''}</p>
                  </div>
                  <div className="cartera-card-right">
                    <div className="cartera-total">
                      {cartera.totalCartera
                        ? cartera.totalCartera.toLocaleString('es-ES', { minimumFractionDigits: 2 })
                        : '0,00'}{' '}
                      €
                    </div>
                    <div className="cartera-activos">{cartera.totalActivosCartera} Activo/s</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="carteras-widget-footer">
          <span className="carteras-count">
            Mostrando página {pagina + 1} de {totalPaginas || 1} ({totalElementos} carteras en total)
          </span>
          <div className="carteras-pagination">
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setPagina((prev) => Math.max(0, prev - 1))}
              disabled={pagina === 0 || cargando}
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setPagina((prev) => Math.min(totalPaginas - 1, prev + 1))}
              disabled={pagina >= totalPaginas - 1 || cargando}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal de Detalle y Edición de Cartera con Filtros ── */}
      {carteraSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Detalle de la Cartera</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setCarteraSeleccionada(null)}
                aria-label="Cerrar modal"
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              {errorDetalle && <p className="modal-error">⚠️ {errorDetalle}</p>}

              {/* Formulario de Edición de Cartera */}
              <div className="modal-section">
                <h4>Datos Generales</h4>
                <div className="modal-form-row">
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label>Nombre de la Cartera</label>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: nombreEdit.length > 100 ? '#ef4444' : 'var(--text-secondary, #94a3b8)',
                          fontWeight: nombreEdit.length > 100 ? 700 : 500,
                        }}
                      >
                        {nombreEdit.length}/100
                      </span>
                    </div>
                    <input
                      type="text"
                      value={nombreEdit}
                      onChange={(e) => setNombreEdit(e.target.value)}
                      className="modal-input"
                      style={nombreEdit.length > 100 ? { borderColor: '#ef4444' } : undefined}
                    />
                    {nombreEdit.length > 100 && (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                        Has superado el máximo de 100 caracteres por {nombreEdit.length - 100}.
                      </span>
                    )}
                  </div>
                </div>
                <div className="modal-form-row">
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label>Descripción</label>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: descripcionEdit.length > 500 ? '#ef4444' : 'var(--text-secondary, #94a3b8)',
                          fontWeight: descripcionEdit.length > 500 ? 700 : 500,
                        }}
                      >
                        {descripcionEdit.length}/500
                      </span>
                    </div>
                    <textarea
                      value={descripcionEdit}
                      onChange={(e) => setDescripcionEdit(e.target.value)}
                      className="modal-textarea"
                      rows={3}
                      style={descripcionEdit.length > 500 ? { borderColor: '#ef4444' } : undefined}
                    />
                    {descripcionEdit.length > 500 && (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                        Has superado el máximo de 500 caracteres por {descripcionEdit.length - 500}.
                      </span>
                    )}
                  </div>
                </div>
                <div className="cartera-actions-row">
                  <button
                    type="button"
                    className="btn-save-cartera"
                    onClick={handleGuardarCartera}
                  >
                    <FiSave /> Guardar Cambios
                  </button>
                  <button
                    type="button"
                    className="btn-danger-cartera"
                    onClick={() => setModalConfirmCartera(true)}
                  >
                    <FiTrash2 /> Eliminar Cartera
                  </button>
                </div>
              </div>

              {/* Sección de Activos con Filtros y Ordenación */}
              <div className="modal-section border-top">
                <div className="assets-section-header">
                  <div className="assets-header-title">
                    <h4>
                      Activos de la Cartera{' '}
                      <span className="assets-count-badge">{activosFiltrados.length}</span>
                    </h4>
                  </div>

                  <div className="assets-header-actions">
                    <div className="filter-group">
                      <CustomSelect
                        className="assets-header-select"
                        options={[
                          { value: 'TODOS', label: 'Todos los tipos' },
                          { value: 'FIAT', label: 'Fiat' },
                          { value: 'CRYPTO', label: 'Crypto' },
                          { value: 'ACCION', label: 'Acciones' },
                          { value: 'ETF', label: 'ETFs' },
                          { value: 'FONDO_INDEXADO', label: 'Fondos Indexados' },
                          { value: 'BONOS_TESORO', label: 'Bonos del Tesoro' },
                          { value: 'OTHER', label: 'Otros' },
                        ]}
                        value={filtroTipoActivo}
                        onChange={(val) => setFiltroTipoActivo(String(val))}
                      />
                    </div>

                    <div className="filter-group">
                      <CustomSelect
                        className="assets-header-select"
                        options={[
                          { value: 'balance,desc', label: 'Mayor Balance' },
                          { value: 'balance,asc', label: 'Menor Balance' },
                          { value: 'nombreActivo,asc', label: 'Nombre (A - Z)' },
                          { value: 'fechaObtencionActivo,desc', label: 'Más recientes' },
                          { value: 'fechaObtencionActivo,asc', label: 'Más antiguos' },
                        ]}
                        value={ordenActivos}
                        onChange={(val) => handleCambioOrdenActivos(String(val))}
                      />
                    </div>

                    <button
                      type="button"
                      className="btn-primary btn-add-activo"
                      onClick={() => setMostrandoNuevoActivo(!mostrandoNuevoActivo)}
                    >
                      <FiPlus style={{ fontSize: '1.1rem' }} />
                      Añadir Activo
                    </button>
                  </div>
                </div>

                {/* Formulario Añadir Nuevo Activo */}
                {mostrandoNuevoActivo && (
                  <form className="nuevo-activo-form" onSubmit={handleCrearActivo}>
                    <h5>Nuevo Activo</h5>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Nombre</label>
                        <input
                          type="text"
                          placeholder="S&P 500 ETF..."
                          value={nuevoActivoNombre}
                          onChange={(e) => setNuevoActivoNombre(e.target.value)}
                          className="modal-input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Tipo</label>
                        <CustomSelect
                          options={[
                            { value: 'FIAT', label: 'Fiat' },
                            { value: 'ACCION', label: 'Acción' },
                            { value: 'ETF', label: 'ETF' },
                            { value: 'CRYPTO', label: 'Crypto' },
                            { value: 'FONDO_INDEXADO', label: 'Fondo' },
                            { value: 'BONOS_TESORO', label: 'Bonos' },
                            { value: 'OTHER', label: 'Otro' },
                          ]}
                          value={nuevoActivoTipo}
                          onChange={(val) => setNuevoActivoTipo(val as TipoActivo)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Balance (€)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          placeholder="0.00"
                          value={nuevoActivoBalance}
                          onChange={(e) => setNuevoActivoBalance(e.target.value)}
                          className="modal-input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Fecha Obtención</label>
                        <input
                          type="datetime-local"
                          value={nuevoActivoFecha}
                          onChange={(e) => setNuevoActivoFecha(e.target.value)}
                          className="modal-input"
                        />
                      </div>
                    </div>
                    <div className="form-actions-sm">
                      <button type="submit" className="btn-sm btn-success-sm">
                        Aceptar
                      </button>
                      <button
                        type="button"
                        className="btn-sm btn-cancel-sm"
                        onClick={() => setMostrandoNuevoActivo(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                {/* Tabla de Activos */}
                <div className="modal-table-container">
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Balance</th>
                        <th>Obtenido el</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="table-empty">
                            No hay activos que coincidan con los filtros seleccionados.
                          </td>
                        </tr>
                      ) : (
                        activosFiltrados.map((activo) => {
                          const esEditando = activoEditandoId === activo.idActivo;
                          return (
                            <tr
                              key={activo.idActivo}
                              className={esEditando ? 'editing-row' : ''}
                            >
                              <td>
                                {esEditando ? (
                                  <input
                                    type="text"
                                    value={activoNombreEdit}
                                    onChange={(e) => setActivoNombreEdit(e.target.value)}
                                    className="modal-table-input"
                                  />
                                ) : (
                                  activo.nombreActivo
                                )}
                              </td>
                              <td>
                                {esEditando ? (
                                  <CustomSelect
                                    className="table-select"
                                    options={[
                                      { value: 'FIAT', label: 'Fiat' },
                                      { value: 'ACCION', label: 'Acción' },
                                      { value: 'ETF', label: 'ETF' },
                                      { value: 'CRYPTO', label: 'Crypto' },
                                      { value: 'FONDO_INDEXADO', label: 'Fondo' },
                                      { value: 'BONOS_TESORO', label: 'Bonos' },
                                      { value: 'OTHER', label: 'Otro' },
                                    ]}
                                    value={activoTipoEdit}
                                    onChange={(val) => setActivoTipoEdit(val as TipoActivo)}
                                  />
                                ) : (
                                  <span
                                    className={`badge-tipo badge-${(activo.tipoActivo || activo.tipo || 'FIAT').toLowerCase()}`}
                                  >
                                    {activo.tipoActivo || activo.tipo || 'FIAT'}
                                  </span>
                                )}
                              </td>
                              <td style={{ fontWeight: 600 }}>
                                {esEditando ? (
                                  <input
                                    type="number"
                                    step="any"
                                    value={activoBalanceEdit}
                                    onChange={(e) => setActivoBalanceEdit(e.target.value)}
                                    className="modal-table-input"
                                  />
                                ) : (
                                  `${(activo.balance || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`
                                )}
                              </td>
                              <td>
                                {esEditando ? (
                                  <input
                                    type="datetime-local"
                                    value={activoFechaEdit}
                                    onChange={(e) => setActivoFechaEdit(e.target.value)}
                                    className="modal-table-input"
                                  />
                                ) : activo.fechaObtencionActivo ? (
                                  new Date(activo.fechaObtencionActivo).toLocaleString('es-ES')
                                ) : (
                                  'No especificada'
                                )}
                              </td>
                              <td>
                                <div className="table-actions">
                                  {esEditando ? (
                                    <>
                                      <button
                                        type="button"
                                        className="btn-action btn-success"
                                        onClick={() => activo.idActivo && handleGuardarActivo(activo.idActivo)}
                                        title="Guardar"
                                      >
                                        <FiCheck />
                                      </button>
                                      <button
                                        type="button"
                                        className="btn-action btn-cancel"
                                        onClick={cancelarEdicionActivo}
                                        title="Cancelar"
                                      >
                                        <FiX />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        className="btn-action btn-edit"
                                        onClick={() => iniciarEdicionActivo(activo)}
                                        title="Editar activo"
                                      >
                                        <FiEdit2 />
                                      </button>
                                      <button
                                        type="button"
                                        className="btn-action btn-delete"
                                        onClick={() => setActivoAEliminar(activo)}
                                        title="Eliminar activo"
                                      >
                                        <FiTrash2 />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar Cartera */}
      <ConfirmModal
        isOpen={modalConfirmCartera}
        title="¿Eliminar Cartera?"
        message={`¿Estás seguro de que deseas eliminar la cartera "${carteraSeleccionada?.nombreCartera}"? Esta acción borrará la cartera y todos sus activos asociados de forma irreversible.`}
        confirmText="Eliminar Cartera"
        cancelText="Cancelar"
        variant="danger"
        loading={eliminandoProceso}
        onConfirm={ejecutarEliminarCartera}
        onCancel={() => setModalConfirmCartera(false)}
      />

      {/* Modal de Confirmación para Eliminar Activo Individual */}
      <ConfirmModal
        isOpen={activoAEliminar !== null}
        title="¿Eliminar Activo?"
        message={`¿Estás seguro de que deseas eliminar el activo "${activoAEliminar?.nombreActivo}" (${activoAEliminar?.balance ?? 0} €)? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Activo"
        cancelText="Cancelar"
        variant="danger"
        loading={eliminandoProceso}
        onConfirm={ejecutarEliminarActivo}
        onCancel={() => setActivoAEliminar(null)}
      />

      <Footer />
    </main>
  );
}
