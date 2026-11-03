const express = require('express');
const cors = require('cors');
const db = require('./db');
 
const app = express();
const PORT = 5000;
 
app.use(cors());
app.use(express.json());
 
// 1. Ruta para consultar inventario y alertas
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// 2. Ruta para registrar venta y descontar stock automáticamente
app.post('/api/ventas', async (req, res) => {
  const { id_producto, cantidad, tipo_pago } = req.body;
 
  try {
    // Verificar si hay stock suficiente
    const [prod] = await db.query(
      'SELECT stock_actual, precio_venta, nombre_comercial FROM productos WHERE id_producto = ?',
      [id_producto]
    );
 
    if (prod.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
 
    if (prod[0].stock_actual < cantidad) {
      return res.status(400).json({
        error: `Stock insuficiente. Solo quedan ${prod[0].stock_actual} unidades.`
      });
    }
 
    // Descontar el stock en MySQL
    await db.query(
      'UPDATE productos SET stock_actual = stock_actual - ? WHERE id_producto = ?',
      [cantidad, id_producto]
    );
 
    const total = prod[0].precio_venta * cantidad;
 
    res.json({
      mensaje: '¡Venta registrada con éxito!',
      producto: prod[0].nombre_comercial,
      cantidad: cantidad,
      total: `S/ ${total.toFixed(2)}`,
      tipo_pago: tipo_pago
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
});
 