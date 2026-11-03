const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Ruta para probar si la base de datos responde
app.get('/api/productos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
});