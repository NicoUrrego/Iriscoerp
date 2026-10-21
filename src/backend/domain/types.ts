export type Role = 'ADMIN' | 'VENTAS' | 'INVENTARIO';
export type Module = 'dashboard' | 'productos' | 'materiales' | 'pedidos' | 'finanzas' | 'reportes' | 'costos' | 'gastos' | 'empleados' | 'maquinaria' | 'usuarios' | 'backup';
export interface User { id: string; username: string; email: string; role: Role }
export interface Account extends User { salt: string; passwordHash: string }
export interface Session { user: User; modules: Module[]; token: string }
export interface Product { id: string; nombre: string; categoria: string; precio: number; costoProduccion: number; descuento: number; stock: number }
export interface Material { id: string; nombre: string; categoria: string; cantidad: number; unidad: string; stockMinimo: number; ultimaCompra: string }
export type Status = 'Pendiente' | 'En proceso' | 'Completado';
export interface OrderItem { productoId: string; nombre: string; cantidad: number; precio: number; costoProduccion: number; descuento: number; subtotal: number }
export interface Order { id: string; cliente: string; telefono: string; email: string; direccion: string; items: OrderItem[]; productos: string; cantidad: number; total: number; formaPago: string; estado: Status; fecha: string; fechaVenta: string | null }
export interface FixedCost { id: string; concepto: string; categoria: string; monto: number; frecuencia: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Anual'; fechaPago: string; inicio: string }
export interface Expense { id: string; concepto: string; categoria: 'Materias primas' | 'Mano de obra' | 'Otros'; monto: number; fecha: string }
export interface Employee { id: string; nombre: string; rol: string; salario: number; horario: string; telefono: string; email: string; fechaIngreso: string }
export interface Machine { id: string; nombre: string; tipo: string; estado: 'Activo' | 'Mantenimiento' | 'Reparación'; ubicacion: string; ultimoMantenimiento: string; proximoMantenimiento: string; costoMantenimiento: number }
export interface Movement { id: string; concepto: string; categoria: string; monto: number; fecha: string; tipo: 'INGRESO' | 'GASTO' }
export interface Analytics {
  desde: string; hasta: string; ingresos: number; gastos: number; gananciaNeta: number; margen: number;
  costoProduccion: number; utilidadBruta: number; productividad: number | null; crecimiento: number | null; unidadesVendidas: number;
  ventasUltimoMes: number; variacionVentas: number | null; stock: number; variacionStock: number | null;
  pedidosActivos: number; variacionPedidos: number | null;
  meses: { mes: string; ingresos: number; gastos: number }[];
  gastosPorCategoria: { nombre: string; monto: number }[]; productosMasVendidos: { nombre: string; cantidad: number; ingresos: number; costo: number }[];
  pedidosRecientes: Order[]; movimientos: Movement[]; bajoStock: Material[];
}
export const permissions: Record<Role, Module[]> = {
  ADMIN: ['dashboard','pedidos','productos','materiales','finanzas','reportes','empleados','maquinaria','costos','gastos','usuarios','backup'],
  VENTAS: ['pedidos','productos'], INVENTARIO: ['productos','materiales'],
};
