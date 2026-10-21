<<<<<<< HEAD
PRAGMA foreign_keys=ON;
CREATE TABLE usuarios (
  id TEXT PRIMARY KEY, nombre_usuario TEXT NOT NULL UNIQUE COLLATE NOCASE,
  correo TEXT NOT NULL UNIQUE COLLATE NOCASE, rol TEXT NOT NULL CHECK(rol IN ('ADMIN','VENTAS','INVENTARIO')),
  salt TEXT NOT NULL, password_hash TEXT NOT NULL, creado_en TEXT NOT NULL
);
CREATE TABLE sesiones (
  token_hash TEXT PRIMARY KEY, usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  vence_en INTEGER NOT NULL
);
CREATE INDEX idx_sesiones_vencimiento ON sesiones(vence_en);
CREATE TABLE login_intentos(id INTEGER PRIMARY KEY CHECK(id=1), cantidad INTEGER NOT NULL, hasta INTEGER NOT NULL);
CREATE TABLE categorias (
  id INTEGER PRIMARY KEY, ambito TEXT NOT NULL CHECK(ambito IN ('PRODUCTO','MATERIAL','FINANZA')),
  nombre TEXT NOT NULL, UNIQUE(ambito,nombre)
);
CREATE TABLE productos (
  id TEXT PRIMARY KEY, nombre TEXT NOT NULL, categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  precio_centavos INTEGER NOT NULL CHECK(precio_centavos>=0), costo_centavos INTEGER NOT NULL CHECK(costo_centavos>=0),
  descuento REAL NOT NULL DEFAULT 0 CHECK(descuento BETWEEN 0 AND 100), stock INTEGER NOT NULL CHECK(stock>=0 AND typeof(stock)='integer')
);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE TABLE materiales (
  id TEXT PRIMARY KEY, nombre TEXT NOT NULL, categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  cantidad REAL NOT NULL CHECK(cantidad>=0), unidad TEXT NOT NULL, stock_minimo REAL NOT NULL CHECK(stock_minimo>=0), ultima_compra TEXT NOT NULL
);
CREATE TABLE clientes (
  id TEXT PRIMARY KEY, nombre TEXT NOT NULL, telefono TEXT NOT NULL, correo TEXT NOT NULL, direccion TEXT NOT NULL
);
CREATE TABLE pedidos (
  id TEXT PRIMARY KEY, cliente_id TEXT NOT NULL REFERENCES clientes(id), fecha TEXT NOT NULL,
  fecha_venta TEXT, estado TEXT NOT NULL CHECK(estado IN ('Pendiente','En proceso','Completado')),
  forma_pago TEXT NOT NULL CHECK(forma_pago IN ('Efectivo','Tarjeta','Transferencia')),
  CHECK((estado='Completado' AND fecha_venta IS NOT NULL) OR (estado<>'Completado' AND fecha_venta IS NULL))
);
CREATE INDEX idx_pedidos_estado_fecha ON pedidos(estado,fecha_venta);
CREATE TABLE detalle_pedido (
  id TEXT PRIMARY KEY, pedido_id TEXT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id TEXT NOT NULL REFERENCES productos(id) ON DELETE RESTRICT, nombre TEXT NOT NULL,
  cantidad INTEGER NOT NULL CHECK(cantidad>0 AND typeof(cantidad)='integer'),
  precio_centavos INTEGER NOT NULL CHECK(precio_centavos>=0), costo_centavos INTEGER NOT NULL CHECK(costo_centavos>=0),
  descuento REAL NOT NULL CHECK(descuento BETWEEN 0 AND 100), subtotal_centavos INTEGER NOT NULL CHECK(subtotal_centavos>=0), posicion INTEGER NOT NULL,
  UNIQUE(pedido_id,producto_id)
);
CREATE INDEX idx_detalle_producto ON detalle_pedido(producto_id);
CREATE TABLE costos_fijos (
  id TEXT PRIMARY KEY, concepto TEXT NOT NULL, categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  monto_centavos INTEGER NOT NULL CHECK(monto_centavos>=0), frecuencia TEXT NOT NULL CHECK(frecuencia IN ('Mensual','Bimestral','Trimestral','Anual')),
  dia_pago INTEGER NOT NULL CHECK(dia_pago BETWEEN 1 AND 31), inicio TEXT NOT NULL
);
CREATE TABLE gastos (
  id TEXT PRIMARY KEY, concepto TEXT NOT NULL, categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  monto_centavos INTEGER NOT NULL CHECK(monto_centavos>0), fecha TEXT NOT NULL
);
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE TABLE empleados (
  id TEXT PRIMARY KEY, nombre TEXT NOT NULL, rol TEXT NOT NULL, salario_centavos INTEGER NOT NULL CHECK(salario_centavos>=0),
  horario TEXT NOT NULL, telefono TEXT NOT NULL, correo TEXT NOT NULL UNIQUE COLLATE NOCASE, fecha_ingreso TEXT NOT NULL
);
CREATE TABLE maquinaria (
  id TEXT PRIMARY KEY, nombre TEXT NOT NULL, tipo TEXT NOT NULL, estado TEXT NOT NULL CHECK(estado IN ('Activo','Mantenimiento','Reparación')), ubicacion TEXT NOT NULL
);
CREATE TABLE mantenimientos_maquinaria (
  id TEXT PRIMARY KEY, maquinaria_id TEXT NOT NULL UNIQUE REFERENCES maquinaria(id) ON DELETE CASCADE,
  ultima_fecha TEXT NOT NULL, proxima_fecha TEXT NOT NULL, costo_centavos INTEGER NOT NULL CHECK(costo_centavos>=0)
);
CREATE TABLE eventos_stock (
  id TEXT PRIMARY KEY, producto_id TEXT REFERENCES productos(id) ON DELETE SET NULL,
  delta INTEGER NOT NULL, fecha TEXT NOT NULL, usuario_id TEXT NOT NULL REFERENCES usuarios(id), motivo TEXT NOT NULL
);
CREATE INDEX idx_stock_fecha ON eventos_stock(fecha);
CREATE TABLE eventos_pedidos (
  id TEXT PRIMARY KEY, pedido_id TEXT REFERENCES pedidos(id) ON DELETE SET NULL,
  delta INTEGER NOT NULL, fecha TEXT NOT NULL, usuario_id TEXT NOT NULL REFERENCES usuarios(id)
);
CREATE INDEX idx_eventos_pedidos_fecha ON eventos_pedidos(fecha);
CREATE VIEW v_pedidos_total AS
SELECT p.id,COALESCE(SUM(d.subtotal_centavos),0) AS total_centavos,COALESCE(SUM(d.cantidad),0) AS cantidad
FROM pedidos p LEFT JOIN detalle_pedido d ON d.pedido_id=p.id GROUP BY p.id;
CREATE VIEW v_materiales_bajo_stock AS SELECT * FROM materiales WHERE cantidad<stock_minimo;
=======
-- ============================================================
-- IRIS.CO - Esquema SQLite (gestion textil / ERP movil)
-- Dinero en centavos (INTEGER), fechas ISO 8601 (TEXT),
-- booleanos 0/1. Ejecutar PRAGMA foreign_keys = ON en cada conexion.
-- ============================================================
PRAGMA foreign_keys = ON;

CREATE TABLE empleados (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL,
  salario_centavos INTEGER NOT NULL CHECK (salario_centavos >= 0),
  horario TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  fecha_ingreso TEXT NOT NULL,
  activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY,
  nombre_usuario TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'ADMIN',
  empleado_id INTEGER UNIQUE,
  activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE SET NULL
);

CREATE TABLE clientes (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  direccion TEXT,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias_productos (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE productos (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria_id INTEGER NOT NULL,
  precio_centavos INTEGER NOT NULL CHECK (precio_centavos >= 0),
  costo_produccion_centavos INTEGER NOT NULL CHECK (costo_produccion_centavos >= 0),
  descuento_porcentaje REAL NOT NULL DEFAULT 0
    CHECK (descuento_porcentaje BETWEEN 0 AND 100),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias_productos(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE pedidos (
  id INTEGER PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  cliente_id INTEGER NOT NULL,
  fecha TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Pendiente'
    CHECK (estado IN ('Pendiente', 'En proceso', 'Completado')),
  forma_pago TEXT NOT NULL DEFAULT 'Efectivo'
    CHECK (forma_pago IN ('Efectivo', 'Tarjeta', 'Transferencia')),
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE detalle_pedido (
  id INTEGER PRIMARY KEY,
  pedido_id INTEGER NOT NULL,
  producto_id INTEGER NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario_centavos INTEGER NOT NULL CHECK (precio_unitario_centavos >= 0),
  descuento_porcentaje REAL NOT NULL DEFAULT 0
    CHECK (descuento_porcentaje BETWEEN 0 AND 100),
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE categorias_materiales (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE materiales (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria_id INTEGER NOT NULL,
  cantidad REAL NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  unidad TEXT NOT NULL
    CHECK (unidad IN ('metros', 'kilogramos', 'unidades', 'carretes', 'rollos')),
  stock_minimo REAL NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
  ultima_compra TEXT,
  FOREIGN KEY (categoria_id) REFERENCES categorias_materiales(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE movimientos_inventario (
  id INTEGER PRIMARY KEY,
  producto_id INTEGER,
  material_id INTEGER,
  tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA', 'AJUSTE')),
  cantidad REAL NOT NULL CHECK (cantidad > 0),
  motivo TEXT,
  fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario_id INTEGER,
  CHECK (
    (producto_id IS NOT NULL AND material_id IS NULL) OR
    (producto_id IS NULL AND material_id IS NOT NULL)
  ),
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
  FOREIGN KEY (material_id) REFERENCES materiales(id) ON DELETE RESTRICT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE maquinaria (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Activo'
    CHECK (estado IN ('Activo', 'Mantenimiento', 'Reparación')),
  ubicacion TEXT NOT NULL,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mantenimientos_maquinaria (
  id INTEGER PRIMARY KEY,
  maquinaria_id INTEGER NOT NULL,
  fecha_mantenimiento TEXT NOT NULL,
  proximo_mantenimiento TEXT,
  costo_centavos INTEGER NOT NULL DEFAULT 0 CHECK (costo_centavos >= 0),
  notas TEXT,
  FOREIGN KEY (maquinaria_id) REFERENCES maquinaria(id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE categorias_financieras (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('INGRESO', 'GASTO')),
  UNIQUE (nombre, tipo)
);

CREATE TABLE costos_fijos (
  id INTEGER PRIMARY KEY,
  concepto TEXT NOT NULL,
  categoria_id INTEGER NOT NULL,
  monto_centavos INTEGER NOT NULL CHECK (monto_centavos >= 0),
  frecuencia TEXT NOT NULL
    CHECK (frecuencia IN ('Mensual', 'Bimestral', 'Trimestral', 'Anual')),
  dia_pago INTEGER NOT NULL CHECK (dia_pago BETWEEN 1 AND 31),
  activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  FOREIGN KEY (categoria_id) REFERENCES categorias_financieras(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE movimientos_financieros (
  id INTEGER PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('INGRESO', 'GASTO')),
  concepto TEXT NOT NULL,
  monto_centavos INTEGER NOT NULL CHECK (monto_centavos > 0),
  fecha TEXT NOT NULL,
  categoria_id INTEGER NOT NULL,
  pedido_id INTEGER,
  costo_fijo_id INTEGER,
  mantenimiento_id INTEGER,
  forma_pago TEXT
    CHECK (forma_pago IS NULL OR
           forma_pago IN ('Efectivo', 'Tarjeta', 'Transferencia')),
  usuario_id INTEGER,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias_financieras(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE SET NULL,
  FOREIGN KEY (costo_fijo_id) REFERENCES costos_fijos(id) ON DELETE SET NULL,
  FOREIGN KEY (mantenimiento_id) REFERENCES mantenimientos_maquinaria(id)
    ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_pedidos_cliente_fecha ON pedidos(cliente_id, fecha);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_detalle_pedido_pedido ON detalle_pedido(pedido_id);
CREATE INDEX idx_movimientos_financieros_fecha_tipo ON movimientos_financieros(fecha, tipo);
CREATE INDEX idx_movimientos_inventario_producto ON movimientos_inventario(producto_id);
CREATE INDEX idx_movimientos_inventario_material ON movimientos_inventario(material_id);

-- ------------------------------------------------------------
-- Vistas derivadas (Dashboard / Reportes): no duplican datos
-- ------------------------------------------------------------
CREATE VIEW v_pedidos_total AS
SELECT p.id AS pedido_id, p.numero, p.cliente_id, p.fecha, p.estado, p.forma_pago,
       CAST(ROUND(SUM(d.cantidad * d.precio_unitario_centavos
                      * (1 - d.descuento_porcentaje / 100.0))) AS INTEGER) AS total_centavos
FROM pedidos p
JOIN detalle_pedido d ON d.pedido_id = p.id
GROUP BY p.id;

CREATE VIEW v_materiales_bajo_stock AS
SELECT * FROM materiales WHERE cantidad <= stock_minimo;

CREATE VIEW v_maquinaria_mantenimiento AS
SELECT m.*,
       (SELECT fecha_mantenimiento FROM mantenimientos_maquinaria
         WHERE maquinaria_id = m.id ORDER BY fecha_mantenimiento DESC, id DESC LIMIT 1) AS ultimo_mantenimiento,
       (SELECT proximo_mantenimiento FROM mantenimientos_maquinaria
         WHERE maquinaria_id = m.id ORDER BY fecha_mantenimiento DESC, id DESC LIMIT 1) AS proximo_mantenimiento
FROM maquinaria m;

CREATE VIEW v_balance_mensual AS
SELECT substr(fecha, 1, 7) AS mes,
       SUM(CASE WHEN tipo = 'INGRESO' THEN monto_centavos ELSE 0 END) AS ingresos_centavos,
       SUM(CASE WHEN tipo = 'GASTO'   THEN monto_centavos ELSE 0 END) AS gastos_centavos
FROM movimientos_financieros
GROUP BY mes;
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
