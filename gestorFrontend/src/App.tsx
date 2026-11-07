import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import api from './api/client';
import Layout from './components/Layout';
import Home from './pages/Home';
import Cartera from './pages/Cartera';
import NuevaCartera from './pages/NuevaCartera';
import OperacionesRecurrentes from './pages/OperacionesRecurrentes';
import Historial from './pages/Historial';
import Ajustes from './pages/Ajustes';
import './index.css';

export default function App(): React.JSX.Element {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Validar si toca guardar historial o ejecutar operaciones recurrentes (silencioso en segundo plano)
  useEffect(() => {
    api.post('/operacion-programada/saved/validar')
      .catch((error) => console.error("Error al validar operaciones silenciosamente:", error));
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  return (
    <Routes>
      <Route
        element={
          <Layout
            sidebarOpen={sidebarOpen}
            toggleTheme={toggleTheme}
            theme={theme}
            closeSidebar={() => setSidebarOpen(false)}
          />
        }
      >
        <Route path="/" element={<Home onMenuClick={handleMenuClick} />} />
        <Route path="/cartera" element={<Cartera onMenuClick={handleMenuClick} />} />
        <Route path="/cartera/nueva" element={<NuevaCartera onMenuClick={handleMenuClick} />} />
        <Route path="/operaciones-recurrentes" element={<OperacionesRecurrentes onMenuClick={handleMenuClick} />} />
        <Route path="/historial" element={<Historial onMenuClick={handleMenuClick} />} />
        <Route path="/ajustes" element={<Ajustes onMenuClick={handleMenuClick} />} />
      </Route>
    </Routes>
  );
}
