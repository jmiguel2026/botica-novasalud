const express = require('express');
const cors = require('cors');
const db = require('./db');
 
const app = express();
const PORT = 5000;
 
app.use(cors());
app.use(express.json());
 
// Crear tabla de clientes automáticamente si no existe
const iniciarTablas = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id_cliente INT AUTO_INCREMENT PRIMARY KEY,
        tipo_documento VARCHAR(10) DEFAULT 'DNI',
        numero_documento VARCHAR(20) UNIQUE NOT NULL,
        nombre_completo VARCHAR(150) NOT NULL,
        telefono VARCHAR(20)
      )
    `);
  } catch (error) {
    console.error('Error al inicializar tabla clientes:', error.message);
  }
};
iniciarTablas();
 
// 1. Inventario y Alertas
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// 2. Registro de Ventas
app.post('/api/ventas', async (req, res) => {
  const { id_producto, cantidad, tipo_pago } = req.body;
  try {
    const [prod] = await db.query(
      'SELECT stock_actual, precio_venta, nombre_comercial FROM productos WHERE id_producto = ?',
      [id_producto]
    );
 
    if (prod.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    if (prod[0].stock_actual < cantidad) {
      return res.status(400).json({ error: `Stock insuficiente. Solo quedan ${prod[0].stock_actual} unidades.` });
    }
 
    await db.query(
      'UPDATE productos SET stock_actual = stock_actual - ? WHERE id_producto = ?',
      [cantidad, id_producto]
    );
 
    const total = prod[0].precio_venta * cantidad;
    res.json({
      mensaje: '¡Venta registrada con éxito!',
      producto: prod[0].nombre_comercial,
      cantidad,
      total: `S/ ${total.toFixed(2)}`,
      tipo_pago
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// 3. Módulo de Clientes (Nuevo de developR)
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
    res.json({ mensaje: '¡Cliente registrado con éxito en la botica!' });
  } catch (error) {
    res.status(500).json({ error: 'El DNI ya se encuentra registrado o hubo un error.' });
  }
});
 
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
});
 