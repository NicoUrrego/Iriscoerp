import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { mes: 'Ene', ingresos: 67000, gastos: 45000 },
  { mes: 'Feb', ingresos: 72000, gastos: 48000 },
  { mes: 'Mar', ingresos: 68000, gastos: 46000 },
  { mes: 'Abr', ingresos: 81000, gastos: 52000 },
  { mes: 'May', ingresos: 75000, gastos: 49000 },
  { mes: 'Jun', ingresos: 89000, gastos: 55000 },
];

const categoriesData = [
  { categoria: 'Materias primas', monto: 28000 },
  { categoria: 'Salarios', monto: 18000 },
  { categoria: 'Servicios', monto: 5000 },
  { categoria: 'Mantenimiento', monto: 4000 },
];

export default function Finanzas() {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');

  const totalIngresos = monthlyData[monthlyData.length - 1].ingresos;
  const totalGastos = monthlyData[monthlyData.length - 1].gastos;
  const ganancia = totalIngresos - totalGastos;
  const margen = (ganancia / totalIngresos) * 100;

  const ingresosAnterior = monthlyData[monthlyData.length - 2].ingresos;
  const cambioIngresos = ((totalIngresos - ingresosAnterior) / ingresosAnterior) * 100;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="mb-1">Finanzas</h1>
        <p className="text-muted-foreground">Control de ingresos y gastos</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {['mes', 'trimestre', 'año'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${
              selectedPeriod === period
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-border hover:bg-accent'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+{cambioIngresos.toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-2xl mb-1">${totalIngresos.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Ingresos totales</p>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl mb-1">${totalGastos.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Gastos totales</p>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl mb-1">${ganancia.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Ganancia neta</p>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl mb-1">{margen.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">Margen de ganancia</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos vs Gastos */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="mb-6">Ingresos vs Gastos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
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
              <Line
                type="monotone"
                dataKey="ingresos"
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

        {/* Gastos por categoría */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="mb-6">Gastos por categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="categoria" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="monto" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-border rounded-xl p-6 mt-6">
        <h3 className="mb-4">Movimientos recientes</h3>
        <div className="space-y-3">
          {[
            {
              tipo: 'ingreso',
              concepto: 'Venta mayorista - María González',
              monto: 12500,
              fecha: '2026-04-10',
            },
            {
              tipo: 'gasto',
              concepto: 'Compra de tela de algodón',
              monto: 8500,
              fecha: '2026-04-09',
            },
            {
              tipo: 'ingreso',
              concepto: 'Venta pedido #1235',
              monto: 8900,
              fecha: '2026-04-08',
            },
            {
              tipo: 'gasto',
              concepto: 'Pago de salarios',
              monto: 18000,
              fecha: '2026-04-05',
            },
            { tipo: 'gasto', concepto: 'Servicios (luz, agua)', monto: 3200, fecha: '2026-04-03' },
          ].map((mov, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <p className="mb-1">{mov.concepto}</p>
                <p className="text-sm text-muted-foreground">{mov.fecha}</p>
              </div>
              <p
                className={`text-lg ${
                  mov.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {mov.tipo === 'ingreso' ? '+' : '-'}${mov.monto.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
