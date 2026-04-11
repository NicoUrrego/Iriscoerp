import { Download, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const ventasMensuales = [
  { mes: 'Ene', ventas: 145, valor: 67000 },
  { mes: 'Feb', ventas: 168, valor: 72000 },
  { mes: 'Mar', ventas: 152, valor: 68000 },
  { mes: 'Abr', ventas: 189, valor: 81000 },
  { mes: 'May', ventas: 175, valor: 75000 },
  { mes: 'Jun', ventas: 203, valor: 89000 },
];

const productosPorCategoria = [
  { nombre: 'Camisas', valor: 145, porcentaje: 31 },
  { nombre: 'Pantalones', valor: 98, porcentaje: 21 },
  { nombre: 'Vestidos', valor: 87, porcentaje: 19 },
  { nombre: 'Chaquetas', valor: 76, porcentaje: 16 },
  { nombre: 'Otros', valor: 62, porcentaje: 13 },
];

const crecimiento = [
  { trimestre: 'Q1 2025', crecimiento: 12 },
  { trimestre: 'Q2 2025', crecimiento: 18 },
  { trimestre: 'Q3 2025', crecimiento: 25 },
  { trimestre: 'Q4 2025', crecimiento: 32 },
  { trimestre: 'Q1 2026', crecimiento: 38 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reportes() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-1">Reportes</h1>
          <p className="text-muted-foreground">Análisis y estadísticas del negocio</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
          <Download className="w-5 h-5" />
          Exportar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Total vendido (mes actual)</p>
          <p className="text-3xl mb-2">203 unidades</p>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+15.8% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Ingresos (mes actual)</p>
          <p className="text-3xl mb-2">$89,000</p>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+18.7% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Ticket promedio</p>
          <p className="text-3xl mb-2">$438</p>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+2.5% vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ventas mensuales */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="mb-6">Ventas mensuales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ventasMensuales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="ventas" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por categoría */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="mb-6">Distribución por categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productosPorCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nombre, porcentaje }) => `${nombre} ${porcentaje}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="valor"
              >
                {productosPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Crecimiento trimestral */}
        <div className="bg-white border border-border rounded-xl p-6 lg:col-span-2">
          <h3 className="mb-6">Crecimiento trimestral</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={crecimiento}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="trimestre" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="crecimiento"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h3 className="mb-4">Productos más vendidos (últimos 30 días)</h3>
        <div className="space-y-3">
          {[
            { producto: 'Camisa de algodón', unidades: 145, ingresos: 72500 },
            { producto: 'Pantalón de mezclilla', unidades: 98, ingresos: 74970 },
            { producto: 'Vestido floral', unidades: 87, ingresos: 88740 },
            { producto: 'Chaqueta de lana', unidades: 76, ingresos: 136800 },
            { producto: 'Blusa casual', unidades: 62, ingresos: 26505 },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {index + 1}
                </div>
                <div>
                  <p className="mb-1">{item.producto}</p>
                  <p className="text-sm text-muted-foreground">{item.unidades} unidades vendidas</p>
                </div>
              </div>
              <p className="text-lg">${item.ingresos.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
