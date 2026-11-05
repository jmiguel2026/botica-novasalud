const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Inicialización de tablas requeridas y columnas
const iniciarTablas = async () => {
  try {
    // 1. Agregar columna stock_minimo si no existe
    try {
      await db.query("ALTER TABLE productos ADD COLUMN stock_minimo INT DEFAULT 10");
    } catch (e) {
      // Si la columna ya existe, simplemente continúa
    }

    // 2. Tabla de clientes
    await db.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id_cliente INT AUTO_INCREMENT PRIMARY KEY,
        tipo_documento VARCHAR(10) DEFAULT 'DNI',
        numero_documento VARCHAR(20) UNIQUE NOT NULL,
        nombre_completo VARCHAR(150) NOT NULL,
        telefono VARCHAR(20)
      )
    `);

    // 3. Tabla de ventas
    await db.query(`
      CREATE TABLE IF NOT EXISTS ventas (
        id_venta INT AUTO_INCREMENT PRIMARY KEY,
        id_producto INT NOT NULL,
        nombre_producto VARCHAR(150) NOT NULL,
        cantidad INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        tipo_pago VARCHAR(50) NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tablas y columnas sincronizadas con éxito");
  } catch (error) {
    console.error('Error al inicializar tablas:', error.message);
  }
};
iniciarTablas();

// 1. PRODUCTOS (Listar, Agregar, Editar)
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos ORDER BY id_producto ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/productos', async (req, res) => {
  const { nombre_comercial, precio_venta, stock_actual, stock_minimo } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO productos (nombre_comercial, precio_venta, stock_actual, stock_minimo) VALUES (?, ?, ?, ?)',
      [nombre_comercial, precio_venta, stock_actual, stock_minimo || 10]
    );
    res.json({ mensaje: 'Medicamento registrado correctamente', id_producto: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_comercial, precio_venta, stock_actual, stock_minimo } = req.body;
  try {
    await db.query(
      'UPDATE productos SET nombre_comercial = ?, precio_venta = ?, stock_actual = ?, stock_minimo = ? WHERE id_producto = ?',
      [nombre_comercial, precio_venta, stock_actual, stock_minimo, id]
    );
    res.json({ mensaje: 'Medicamento actualizado con éxito' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. VENTAS (Registrar y Consultar Historial)
app.get('/api/ventas', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ventas ORDER BY id_venta DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ventas', async (req, res) => {
  const { id_producto, cantidad, tipo_pago } = req.body;
  try {
    const [prod] = await db.query(
      'SELECT stock_actual, precio_venta, nombre_comercial FROM productos WHERE id_producto = ?',
      [id_producto]
    );

    if (prod.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    if (prod[0].stock_actual < cantidad) {
      return res.status(400).json({ error: `Stock insuficiente. Disponibles: ${prod[0].stock_actual}` });
    }

    // Descontar stock
    await db.query(
      'UPDATE productos SET stock_actual = stock_actual - ? WHERE id_producto = ?',
      [cantidad, id_producto]
    );

    const total = prod[0].precio_venta * cantidad;

    // Registrar en tabla de ventas
    await db.query(
      'INSERT INTO ventas (id_producto, nombre_producto, cantidad, total, tipo_pago) VALUES (?, ?, ?, ?, ?)',
      [id_producto, prod[0].nombre_comercial, cantidad, total, tipo_pago]
    );

    res.json({
      mensaje: 'Venta registrada con éxito',
      producto: prod[0].nombre_comercial,
      total: `S/ ${total.toFixed(2)}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. CLIENTES
app.get('/api/clientes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clientes ORDER BY id_cliente DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  const { numero_documento, nombre_completo, telefono } = req.body;
  try {
    await db.query(
      'INSERT INTO clientes (numero_documento, nombre_completo, telefono) VALUES (?, ?, ?)',
      [numero_documento, nombre_completo, telefono]
    );
    res.json({ mensaje: 'Cliente registrado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'El DNI ya se encuentra registrado' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend de Nova Salud activo en puerto ${PORT}`);
});