CREATE DATABASE IF NOT EXISTS botica_novasalud;
USE botica_novasalud;

CREATE TABLE IF NOT EXISTS productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_comercial VARCHAR(150) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock_actual INT DEFAULT 0
);

INSERT INTO productos (nombre_comercial, precio_venta, stock_actual) 
VALUES ('Paracetamol 500mg', 1.50, 50), ('Amoxicilina 500mg', 2.00, 20);