import React, { useState, useEffect } from 'react';
import './App.css';
 
function App() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
 
  // Función para cargar los productos desde la base de datos
  const cargarProductos = () => {
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
  };
 
  useEffect(() => {
    cargarProductos();
  }, []);
 
  // Función para procesar la venta rápida
  const manejarVenta = async (e) => {
    e.preventDefault();
    const id_producto = e.target.producto.value;
    const cantidad = parseInt(e.target.cantidad.value);
    const tipo_pago = e.target.tipo_pago.value;
 
    try {
      const res = await fetch('http://localhost:5000/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_producto, cantidad, tipo_pago }),
      });
 
      const data = await res.json();
 
      if (res.ok) {
        alert(`✅ ${data.mensaje}\nMedicamento: ${data.producto}\nCantidad: ${data.cantidad}\nTotal a pagar: ${data.total}\nMétodo: ${data.tipo_pago}`);
        cargarProductos(); // Actualiza el stock en la tabla al instante
        e.target.reset();  // Limpia el formulario
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert('Error de conexión con el servidor');
    }
  };
 
  return (
    <div className="contenedor">
      {/* Encabezado */}
      <header className="header">
        <h1>🏥 Botica Nova Salud</h1>
        <p>Sistema Centralizado de Inventario y Ventas</p>
      </header>
 
      {/* Tarjetas de Alertas */}
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
      </section>
 
      {/* Módulo de Atención Rápida / Punto de Venta (POS) */}
      <section className="tabla-seccion" style={{ marginBottom: '25px' }}>
        <h2>⚡ Atención Rápida al Cliente - Registrar Venta</h2>
        <form onSubmit={manejarVenta} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '15px' }}>
          
          <select name="producto" required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minWidth: '220px' }}>
            <option value="">Seleccione Medicamento...</option>
            {productos.map((p) => (
              <option key={p.id_producto} value={p.id_producto}>
                {p.nombre_comercial} (Stock: {p.stock_actual}) - S/ {Number(p.precio_venta).toFixed(2)}
              </option>
            ))}
          </select>
 
          <input
            type="number"
            name="cantidad"
            min="1"
            defaultValue="1"
            placeholder="Cant."
            required
            style={{ padding: '10px', width: '80px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
 
          <select name="tipo_pago" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
            <option value="Efectivo">Efectivo</option>
            <option value="Yape / Plin">Yape / Plin</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
 
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#198754',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            💳 Cobrar e Imprimir Boleta
          </button>
        </form>
      </section>
 
      {/* Tabla de Inventario y Alertas */}
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