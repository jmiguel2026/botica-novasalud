import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = () => {
    Promise.all([
      fetch('http://localhost:5000/api/productos').then((res) => res.json()),
      fetch('http://localhost:5000/api/clientes').then((res) => res.json()),
    ])
      .then(([dataProd, dataCli]) => {
        setProductos(Array.isArray(dataProd) ? dataProd : []);
        setClientes(Array.isArray(dataCli) ? dataCli : []);
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const manejarVenta = async (e) => {
    e.preventDefault();
    const id_producto = e.target.producto.value;
    const cantidad = parseInt(e.target.cantidad.value);
    const tipo_pago = e.target.tipo_pago.value;

    const res = await fetch('http://localhost:5000/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_producto, cantidad, tipo_pago }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(`✅ ${data.mensaje}\nMedicamento: ${data.producto}\nTotal: ${data.total}`);
      cargarDatos();
      e.target.reset();
    } else {
      alert(`❌ Error: ${data.error}`);
    }
  };

  const manejarCliente = async (e) => {
    e.preventDefault();
    const numero_documento = e.target.dni.value;
    const nombre_completo = e.target.nombre.value;
    const telefono = e.target.telefono.value;

    const res = await fetch('http://localhost:5000/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero_documento, nombre_completo, telefono }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(`✅ ${data.mensaje}`);
      cargarDatos();
      e.target.reset();
    } else {
      alert(`❌ ${data.error}`);
    }
  };

  return (
    <div className="contenedor">
      <header className="header">
        <h1>🏥 Botica Nova Salud</h1>
        <p>Sistema Centralizado de Inventario, Ventas y Atención al Cliente</p>
      </header>

      <section className="dashboard-cards">
        <div className="card">
          <h3>Total Medicamentos</h3>
          <p className="numero">{productos.length}</p>
        </div>
        <div className="card alerta">
          <h3>Alertas de Reposición</h3>
          <p className="numero">
            {productos.filter((p) => p.stock_actual <= (p.stock_minimo || 10)).length}
          </p>
        </div>
        <div className="card">
          <h3>Clientes Registrados</h3>
          <p className="numero" style={{ color: '#198754' }}>{clientes.length}</p>
        </div>
      </section>

      <section className="tabla-seccion" style={{ marginBottom: '25px' }}>
        <h2>⚡ Atención Rápida - Registrar Venta</h2>
        <form onSubmit={manejarVenta} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          <select name="producto" required style={{ padding: '10px', borderRadius: '5px', minWidth: '220px' }}>
            <option value="">Seleccione Medicamento...</option>
            {productos.map((p) => (
              <option key={p.id_producto} value={p.id_producto}>
                {p.nombre_comercial} (Stock: {p.stock_actual}) - S/ {Number(p.precio_venta).toFixed(2)}
              </option>
            ))}
          </select>
          <input type="number" name="cantidad" min="1" defaultValue="1" placeholder="Cant." required style={{ padding: '10px', width: '80px', borderRadius: '5px' }} />
          <select name="tipo_pago" style={{ padding: '10px', borderRadius: '5px' }}>
            <option value="Efectivo">Efectivo</option>
            <option value="Yape / Plin">Yape / Plin</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#198754', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            💳 Cobrar e Imprimir
          </button>
        </form>
      </section>

      <section className="tabla-seccion" style={{ marginBottom: '25px' }}>
        <h2>👥 Registro Rápido de Clientes (Fidelización / Boletas)</h2>
        <form onSubmit={manejarCliente} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          <input type="text" name="dni" placeholder="DNI (8 dígitos)" maxLength="8" required style={{ padding: '10px', borderRadius: '5px', width: '160px' }} />
          <input type="text" name="nombre" placeholder="Nombre completo" required style={{ padding: '10px', borderRadius: '5px', flex: '1', minWidth: '200px' }} />
          <input type="text" name="telefono" placeholder="Teléfono" style={{ padding: '10px', borderRadius: '5px', width: '130px' }} />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            ➕ Registrar
          </button>
        </form>
      </section>

      <section className="tabla-seccion">
        <h2>📦 Control de Inventario y Alertas</h2>
        {cargando ? (
          <p>Cargando datos...</p>
        ) : (
          <table className="tabla-botica">
            <thead>
              <tr>
                <th>ID</th>
                <th>Medicamento</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado / Alerta</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => {
                const bajoStock = prod.stock_actual <= (prod.stock_minimo || 10);
                return (
                  <tr key={prod.id_producto} className={bajoStock ? 'fila-alerta' : ''}>
                    <td>{prod.id_producto}</td>
                    <td><strong>{prod.nombre_comercial}</strong></td>
                    <td>S/ {Number(prod.precio_venta).toFixed(2)}</td>
                    <td>{prod.stock_actual} und.</td>
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