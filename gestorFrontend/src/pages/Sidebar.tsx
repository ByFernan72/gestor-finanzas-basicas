import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBriefcase, FiClock, FiSettings, FiSun, FiMoon, FiX, FiRepeat } from 'react-icons/fi';
import './css/Sidebar.css';

export interface SidebarProps {
  isOpen: boolean;
  toggleTheme: () => void;
  theme: string;
  closeSidebar: () => void;
}

export default function Sidebar({
  isOpen,
  toggleTheme,
  theme,
  closeSidebar,
}: SidebarProps): React.JSX.Element {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-container">
          <h2 className="sidebar-title">Gestor Personal</h2>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={closeSidebar}
            aria-label="Cerrar menú"
          >
            <FiX />
          </button>
        </div>
        <hr className="sidebar-divider" />
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <NavLink to="/" className="sidebar-item" onClick={closeSidebar}>
            <FiHome className="sidebar-item-icon" />
            <span>Inicio</span>
          </NavLink>

          <NavLink to="/cartera" className="sidebar-item" onClick={closeSidebar}>
            <FiBriefcase className="sidebar-item-icon" />
            <span>Carteras</span>
          </NavLink>

          <NavLink to="/operaciones-recurrentes" className="sidebar-item" onClick={closeSidebar}>
            <FiRepeat className="sidebar-item-icon" />
            <span>Op. Recurrentes</span>
          </NavLink>

          <NavLink to="/historial" className="sidebar-item" onClick={closeSidebar}>
            <FiClock className="sidebar-item-icon" />
            <span>Historial</span>
          </NavLink>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/ajustes"
          className="sidebar-item sidebar-settings-link"
          onClick={closeSidebar}
        >
          <FiSettings className="sidebar-item-icon" />
          <span>Ajustes</span>
        </NavLink>

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title="Cambiar tema"
        >
          {theme === 'dark' ? (
            <>
              <FiSun className="theme-icon sun" />
              <span>Modo Claro</span>
            </>
          ) : (
            <>
              <FiMoon className="theme-icon moon" />
              <span>Modo Oscuro</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
