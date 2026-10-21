import { useAnalytics } from '../hooks/useAnalytics';
import { TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const {data,error}=useAnalytics('dashboard');
  if(error)return <p role="alert" className="p-8 text-red-700">{error}</p>;
  if(!data)return <p role="status" className="p-8">Cargando resumen de SQLite…</p>;
  const change=(v:number|null)=>v===null?'Sin base anterior':`${v>=0?'+':''}${v.toFixed(1)}%`;
  const salesData=data.meses.map(m=>({...m,ventas:m.ingresos}));
  const productosVendidos=data.productosMasVendidos.map(p=>({producto:p.nombre,cantidad:p.cantidad}));
  const stats=[
    {name:'Ventas del último mes cerrado',value:'$'+data.ventasUltimoMes.toLocaleString('es-CO'),change:change(data.variacionVentas),trend:(data.variacionVentas??0)>=0?'up':'down',icon:DollarSign,color:'text-green-600'},
    {name:'Productos disponibles',value:String(data.stock),change:change(data.variacionStock),trend:(data.variacionStock??0)>=0?'up':'down',icon:Package,color:'text-blue-600'},
    {name:'Pedidos activos',value:String(data.pedidosActivos),change:change(data.variacionPedidos),trend:(data.variacionPedidos??0)>=0?'up':'down',icon:ShoppingCart,color:'text-purple-600'},
    {name:'Ganancia neta del mes',value:'$'+data.gananciaNeta.toLocaleString('es-CO'),change:'',trend:'neutral',icon:DollarSign,color:'text-orange-600'}
  ];
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
          {data.pedidosRecientes.map((pedido) => (
            <div
              key={pedido.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <p className="mb-1">{pedido.cliente}</p>
                <p className="text-sm text-muted-foreground">{pedido.id}</p>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-right">{'$'+pedido.total.toLocaleString('es-CO')}</p>
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
