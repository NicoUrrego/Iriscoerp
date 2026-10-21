<<<<<<< HEAD
INSERT INTO categorias(ambito,nombre) VALUES
 ('PRODUCTO','Camisas'),('PRODUCTO','Pantalones'),('PRODUCTO','Vestidos'),('PRODUCTO','Chaquetas'),('PRODUCTO','Blusas'),
 ('MATERIAL','Telas'),('MATERIAL','Hilos'),('MATERIAL','Accesorios'),
 ('FINANZA','Materias primas'),('FINANZA','Mano de obra'),('FINANZA','Otros');
=======
-- Valores de referencia observados en la interfaz (no son carga obligatoria)
PRAGMA foreign_keys = ON;
INSERT INTO categorias_productos (nombre) VALUES ('Camisas'),('Pantalones'),('Vestidos'),('Chaquetas'),('Blusas');
INSERT INTO categorias_materiales (nombre) VALUES ('Telas'),('Hilos'),('Accesorios');
INSERT INTO categorias_financieras (nombre, tipo) VALUES
 ('Materias primas','GASTO'),('Salarios','GASTO'),('Servicios','GASTO'),
 ('Mantenimiento','GASTO'),('Inmueble','GASTO'),('Seguros','GASTO'),('Ventas','INGRESO');
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
