import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Consultar los productos y alertas al backend
  useEffect(() => {
    fetch('http://localhost:5000/api/productos')
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error al conectar con la API:', err);
        setCargando(false);
      });
  }, []);

  return (
    <div className="contenedor">
      {/* Encabezado */}
      <header className="header">
        <h1>🏥 Botica Nova Salud</h1>
        <p>Sistema Centralizado de Inventario y Ventas</p>
      </header>

      {/* Panel de métricas y alertas */}
      <section className="dashboard-cards">
        <div className="card">
          <h3>Total Productos</h3>
          <p className="numero">{productos.length}</p>
        </div>
        <div className="card alerta">
          <h3>Alertas de Reposición</h3>
          <p className="numero">
            {productos.filter((p) => p.stock_actual <= (p.stock_minimo || 10)).length}
          </p>
        </div>
      </section>

      {/* Tabla de Inventario con Alertas en Tiempo Real */}
      <section className="tabla-seccion">
        <h2>📦 Control de Inventario y Stock</h2>
        {cargando ? (
          <p>Cargando datos desde la base de datos...</p>
        ) : (
          <table className="tabla-botica">
            <thead>
              <tr>
                <th>ID</th>
                <th>Medicamento</th>
                <th>Precio Venta</th>
                <th>Stock Actual</th>
                <th>Estado / Alerta</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => {
                const stockMinimo = prod.stock_minimo || 10;
                const bajoStock = prod.stock_actual <= stockMinimo;

                return (
                  <tr key={prod.id_producto} className={bajoStock ? 'fila-alerta' : ''}>
                    <td>{prod.id_producto}</td>
                    <td><strong>{prod.nombre_comercial}</strong></td>
                    <td>S/ {Number(prod.precio_venta).toFixed(2)}</td>
                    <td>{prod.stock_actual} unidades</td>
                    <td>
                      {bajoStock ? (
                        <span className="badge badge-rojo">⚠️ REPOSICIÓN URGENTE</span>
                      ) : (
                        <span className="badge badge-verde">✅ Stock Óptimo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;