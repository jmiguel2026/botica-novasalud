import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [pestanaActiva, setPestanaActiva] = useState('inventario');

  // Estados para modal de agregar/editar medicamento
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    id_producto: '',
    nombre_comercial: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: 10,
  });

  // Cargar Google Material Symbols
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;500;600';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    Promise.all([
      fetch('http://localhost:5000/api/productos').then((r) => r.json()),
      fetch('http://localhost:5000/api/ventas').then((r) => r.json()),
      fetch('http://localhost:5000/api/clientes').then((r) => r.json()),
    ])
      .then(([dataProd, dataVent, dataCli]) => {
        setProductos(Array.isArray(dataProd) ? dataProd : []);
        setVentas(Array.isArray(dataVent) ? dataVent : []);
        setClientes(Array.isArray(dataCli) ? dataCli : []);
      })
      .catch((err) => console.error('Error al conectar:', err));
  };

  // Abrir modal para crear
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setFormData({ id_producto: '', nombre_comercial: '', precio_venta: '', stock_actual: '', stock_minimo: 10 });
    setModalAbierto(true);
  };

  // Abrir modal para editar (bloqueando ID)
  const abrirModalEditar = (prod) => {
    setModoEdicion(true);
    setFormData({
      id_producto: prod.id_producto,
      nombre_comercial: prod.nombre_comercial,
      precio_venta: prod.precio_venta,
      stock_actual: prod.stock_actual,
      stock_minimo: prod.stock_minimo || 10,
    });
    setModalAbierto(true);
  };

  // Guardar (Crear o Actualizar)
  const guardarMedicamento = async (e) => {
    e.preventDefault();
    const url = modoEdicion
      ? `http://localhost:5000/api/productos/${formData.id_producto}`
      : 'http://localhost:5000/api/productos';
    const method = modoEdicion ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setModalAbierto(false);
      cargarDatos();
    } else {
      alert('Error al procesar la operación');
    }
  };

  // Registrar Venta Rápida
  const ejecutarVenta = async (e) => {
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
      alert(`${data.mensaje} - ${data.total}`);
      cargarDatos();
      e.target.reset();
    } else {
      alert(data.error);
    }
  };

  // Registrar Cliente
  const ejecutarCliente = async (e) => {
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
      alert(data.mensaje);
      cargarDatos();
      e.target.reset();
    } else {
      alert(data.error);
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre_comercial.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="layout-dashboard">
      {/* 1. BARRA LATERAL (SIDEBAR) */}
      <aside className="sidebar">
        <div className="brand">
          <span className="material-symbols-outlined brand-icon">local_pharmacy</span>
          <div className="brand-text">
            <h2>NOVA SALUD</h2>
            <small>Gestión Farmacéutica</small>
          </div>
        </div>

        <button className="btn-sidebar-cta" onClick={abrirModalCrear}>
          <span className="material-symbols-outlined">add</span>
          <span>Nuevo Medicamento</span>
        </button>

        <nav className="nav-menu">
          <button
            className={`nav-item ${pestanaActiva === 'inventario' ? 'active' : ''}`}
            onClick={() => setPestanaActiva('inventario')}
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span>Inventario y Stock</span>
          </button>

          <button
            className={`nav-item ${pestanaActiva === 'ventas' ? 'active' : ''}`}
            onClick={() => setPestanaActiva('ventas')}
          >
            <span className="material-symbols-outlined">point_of_sale</span>
            <span>Punto de Venta</span>
          </button>

          <button
            className={`nav-item ${pestanaActiva === 'historial' ? 'active' : ''}`}
            onClick={() => setPestanaActiva('historial')}
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span>Ventas Registradas</span>
          </button>

          <button
            className={`nav-item ${pestanaActiva === 'clientes' ? 'active' : ''}`}
            onClick={() => setPestanaActiva('clientes')}
          >
            <span className="material-symbols-outlined">group</span>
            <span>Clientes</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="status-box">
            <span className="status-dot"></span>
            <div>
              <p className="status-title">Servidor Activo</p>
              <small className="status-sub">Docker MySQL 8.0</small>
            </div>
          </div>
          <button className="btn-logout">
            <span className="material-symbols-outlined">logout</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL */}
      <main className="main-content">
        {/* Cabecera Superior */}
        <header className="topbar">
          <div className="topbar-title">
            <h1>Panel de Control</h1>
            <p>Botica Nova Salud — Administración Integral</p>
          </div>

          <div className="topbar-actions">
            <div className="user-profile">
              <div className="avatar">A</div>
              <div className="user-info">
                <strong>Administrador</strong>
                <small>Nova Salud S.A.C.</small>
              </div>
            </div>
          </div>
        </header>

        {/* Buscador Superior */}
        <div className="search-container">
          <div className="search-bar">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              placeholder="Buscar medicamento por nombre comercial..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Tarjetas de Métricas */}
        <section className="metricas-grid">
          <div className="tarjeta-metrica">
            <div className="metrica-header">
              <span>Total Medicamentos</span>
              <span className="material-symbols-outlined metrica-icon">medication</span>
            </div>
            <p className="metrica-valor">{productos.length}</p>
          </div>

          <div className="tarjeta-metrica alerta-borde">
            <div className="metrica-header">
              <span>Alertas de Reposición</span>
              <span className="material-symbols-outlined metrica-icon color-alerta">warning</span>
            </div>
            <p className="metrica-valor color-alerta">
              {productos.filter((p) => p.stock_actual <= (p.stock_minimo || 10)).length}
            </p>
          </div>

          <div className="tarjeta-metrica">
            <div className="metrica-header">
              <span>Ventas Realizadas</span>
              <span className="material-symbols-outlined metrica-icon">shopping_cart</span>
            </div>
            <p className="metrica-valor">{ventas.length}</p>
          </div>

          <div className="tarjeta-metrica">
            <div className="metrica-header">
              <span>Clientes Registrados</span>
              <span className="material-symbols-outlined metrica-icon color-exito">person_add</span>
            </div>
            <p className="metrica-valor color-exito">{clientes.length}</p>
          </div>
        </section>

        {/* VISTAS DINÁMICAS SEGÚN LA PESTAÑA */}

        {/* PESTAÑA 1: INVENTARIO */}
        {pestanaActiva === 'inventario' && (
          <section className="content-card">
            <div className="card-top-action">
              <h2>Control de Inventario y Stock</h2>
              <button className="btn-secondary" onClick={abrirModalCrear}>
                <span className="material-symbols-outlined">add_circle</span>
                <span>Agregar Producto</span>
              </button>
            </div>

            <table className="tabla-clean">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Medicamento</th>
                  <th>Precio Venta</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((p) => {
                  const bajoStock = p.stock_actual <= (p.stock_minimo || 10);
                  return (
                    <tr key={p.id_producto} className={bajoStock ? 'row-alerta' : ''}>
                      <td><strong>#{p.id_producto}</strong></td>
                      <td>{p.nombre_comercial}</td>
                      <td>S/ {Number(p.precio_venta).toFixed(2)}</td>
                      <td>{p.stock_actual} und.</td>
                      <td>{p.stock_minimo || 10} und.</td>
                      <td>
                        {bajoStock ? (
                          <span className="badge-pill badge-danger">
                            <span className="material-symbols-outlined icon-badge">error</span>
                            Reposición Urgente
                          </span>
                        ) : (
                          <span className="badge-pill badge-success">
                            <span className="material-symbols-outlined icon-badge">check_circle</span>
                            Stock Óptimo
                          </span>
                        )}
                      </td>
                      <td>
                        <button className="btn-icon-action" onClick={() => abrirModalEditar(p)} title="Editar Medicamento">
                          <span className="material-symbols-outlined">edit</span>
                          <span>Editar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {/* PESTAÑA 2: PUNTO DE VENTA */}
        {pestanaActiva === 'ventas' && (
          <section className="content-card">
            <h2>Punto de Venta — Atención Rápida</h2>
            <form onSubmit={ejecutarVenta} className="form-clean-grid">
              <div className="form-group">
                <label>Seleccionar Medicamento</label>
                <select name="producto" required>
                  <option value="">Seleccione...</option>
                  {productos.map((p) => (
                    <option key={p.id_producto} value={p.id_producto}>
                      {p.nombre_comercial} (Stock: {p.stock_actual}) — S/ {Number(p.precio_venta).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Cantidad</label>
                <input type="number" name="cantidad" min="1" defaultValue="1" required />
              </div>

              <div className="form-group">
                <label>Método de Pago</label>
                <select name="tipo_pago">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Yape / Plin">Yape / Plin</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>

              <div className="form-group align-bottom">
                <button type="submit" className="btn-primary">
                  <span className="material-symbols-outlined">payments</span>
                  <span>Cobrar e Imprimir Comprobante</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* PESTAÑA 3: HISTORIAL DE VENTAS */}
        {pestanaActiva === 'historial' && (
          <section className="content-card">
            <h2>Tabla de Ventas Registradas</h2>
            <table className="tabla-clean">
              <thead>
                <tr>
                  <th>N° Venta</th>
                  <th>Medicamento</th>
                  <th>Cantidad</th>
                  <th>Método de Pago</th>
                  <th>Total Cobrado</th>
                  <th>Fecha y Hora</th>
                </tr>
              </thead>
              <tbody>
                {ventas.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No hay ventas registradas aún.</td>
                  </tr>
                ) : (
                  ventas.map((v) => (
                    <tr key={v.id_venta}>
                      <td><strong>VNT-00{v.id_venta}</strong></td>
                      <td>{v.nombre_producto}</td>
                      <td>{v.cantidad} unidades</td>
                      <td><span className="metodo-tag">{v.tipo_pago}</span></td>
                      <td><strong>S/ {Number(v.total).toFixed(2)}</strong></td>
                      <td>{new Date(v.fecha).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* PESTAÑA 4: CLIENTES */}
        {pestanaActiva === 'clientes' && (
          <section className="content-card">
            <h2>Registro Rápido de Clientes</h2>
            <form onSubmit={ejecutarCliente} className="form-clean-grid" style={{ marginBottom: '30px' }}>
              <div className="form-group">
                <label>DNI del Cliente</label>
                <input type="text" name="dni" maxLength="8" placeholder="8 dígitos" required />
              </div>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input type="text" name="nombre" placeholder="Nombres y apellidos" required />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="text" name="telefono" placeholder="Número de contacto" />
              </div>
              <div className="form-group align-bottom">
                <button type="submit" className="btn-primary">
                  <span className="material-symbols-outlined">person_add</span>
                  <span>Registrar Cliente</span>
                </button>
              </div>
            </form>

            <h3>Clientes Almacenados</h3>
            <table className="tabla-clean">
              <thead>
                <tr>
                  <th>DNI</th>
                  <th>Nombre y Apellidos</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id_cliente || c.numero_documento}>
                    <td><strong>{c.numero_documento}</strong></td>
                    <td>{c.nombre_completo}</td>
                    <td>{c.telefono || 'Sin teléfono'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {/* 3. MODAL PARA AGREGAR Y EDITAR MEDICAMENTO */}
      {modalAbierto && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{modoEdicion ? 'Editar Medicamento' : 'Nuevo Medicamento'}</h3>
              <button className="btn-close-modal" onClick={() => setModalAbierto(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={guardarMedicamento}>
              {modoEdicion && (
                <div className="form-field">
                  <label>ID del Producto (No modificable)</label>
                  <input type="text" value={`#${formData.id_producto}`} disabled />
                </div>
              )}

              <div className="form-field">
                <label>Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={formData.nombre_comercial}
                  onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })}
                  placeholder="Ej: Ibuprofeno 400mg"
                />
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Precio Venta (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                    placeholder="Ej: 2.50"
                  />
                </div>

                <div className="form-field">
                  <label>Stock Actual</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_actual}
                    onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                    placeholder="Ej: 50"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Stock Mínimo (Alerta de Reposición)</label>
                <input
                  type="number"
                  required
                  value={formData.stock_minimo}
                  onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                  placeholder="Ej: 10"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <span className="material-symbols-outlined">save</span>
                  <span>{modoEdicion ? 'Guardar Cambios' : 'Registrar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;