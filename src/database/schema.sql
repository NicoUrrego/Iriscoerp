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
