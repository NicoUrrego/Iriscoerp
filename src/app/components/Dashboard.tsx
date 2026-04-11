import { TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const salesData = [
  { mes: 'Ene', ventas: 45000, gastos: 32000 },
  { mes: 'Feb', ventas: 52000, gastos: 35000 },
  { mes: 'Mar', ventas: 48000, gastos: 33000 },
  { mes: 'Abr', ventas: 61000, gastos: 38000 },
  { mes: 'May', ventas: 55000, gastos: 36000 },
  { mes: 'Jun', ventas: 67000, gastos: 40000 },
];

const productosVendidos = [
  { producto: 'Camisas', cantidad: 145 },
  { producto: 'Pantalones', cantidad: 98 },
  { producto: 'Vestidos', cantidad: 67 },
  { producto: 'Chaquetas', cantidad: 54 },
];

const stats = [
  {
    name: 'Ventas totales',
    value: '$67,000',
    change: '+12.5%',
    trend: 'up' as const,
    icon: DollarSign,
    color: 'text-green-600',
  },
  {
    name: 'Productos en stock',
    value: '1,284',
    change: '-3.2%',
    trend: 'down' as const,
    icon: Package,
    color: 'text-blue-600',
  },
  {
    name: 'Pedidos activos',
    value: '47',
    change: '+8.1%',
    trend: 'up' as const,
    icon: ShoppingCart,
    color: 'text-purple-600',
  },
  {
    name: 'Empleados',
    value: '24',
    change: '0%',
    trend: 'neutral' as const,
    icon: Users,
    color: 'text-orange-600',
  },
];

export default function Dashboard() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Vista general de tu negocio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {stat.trend !== 'neutral' && (
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-2xl mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas vs Gastos */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="mb-6">
            <h3 className="mb-1">Ventas vs Gastos</h3>
            <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="gastos"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="mb-6">
            <h3 className="mb-1">Productos más vendidos</h3>
            <p className="text-sm text-muted-foreground">Este mes</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={productosVendidos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="producto" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
              <Bar dataKey="cantidad" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-xl border border-border p-6 mt-6">
        <h3 className="mb-4">Pedidos recientes</h3>
        <div className="space-y-3">
          {[
            { id: '#1234', cliente: 'María González', total: '$12,500', estado: 'Completado' },
            { id: '#1235', cliente: 'Carlos Ramírez', total: '$8,900', estado: 'En proceso' },
            { id: '#1236', cliente: 'Ana López', total: '$15,200', estado: 'Pendiente' },
            { id: '#1237', cliente: 'Jorge Martínez', total: '$6,750', estado: 'Completado' },
          ].map((pedido) => (
            <div
              key={pedido.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <p className="mb-1">{pedido.cliente}</p>
                <p className="text-sm text-muted-foreground">{pedido.id}</p>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-right">{pedido.total}</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    pedido.estado === 'Completado'
                      ? 'bg-green-50 text-green-700'
                      : pedido.estado === 'En proceso'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {pedido.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
