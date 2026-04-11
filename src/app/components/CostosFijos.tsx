import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CostoFijo {
  id: string;
  concepto: string;
  monto: number;
  categoria: string;
  frecuencia: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Anual';
  fechaPago: string;
}

const initialCostos: CostoFijo[] = [
  {
    id: '1',
    concepto: 'Alquiler del local',
    monto: 12000,
    categoria: 'Inmueble',
    frecuencia: 'Mensual',
    fechaPago: '01',
  },
  {
    id: '2',
    concepto: 'Electricidad',
    monto: 2800,
    categoria: 'Servicios',
    frecuencia: 'Mensual',
    fechaPago: '15',
  },
  {
    id: '3',
    concepto: 'Agua',
    monto: 600,
    categoria: 'Servicios',
    frecuencia: 'Mensual',
    fechaPago: '20',
  },
  {
    id: '4',
    concepto: 'Internet y teléfono',
    monto: 850,
    categoria: 'Servicios',
    frecuencia: 'Mensual',
    fechaPago: '10',
  },
  {
    id: '5',
    concepto: 'Seguro del local',
    monto: 4500,
    categoria: 'Seguros',
    frecuencia: 'Trimestral',
    fechaPago: '01',
  },
  {
    id: '6',
    concepto: 'Mantenimiento general',
    monto: 1500,
    categoria: 'Mantenimiento',
    frecuencia: 'Mensual',
    fechaPago: '25',
  },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function CostosFijos() {
  const [costos, setCostos] = useState<CostoFijo[]>(initialCostos);
  const [showModal, setShowModal] = useState(false);
  const [editingCosto, setEditingCosto] = useState<CostoFijo | null>(null);
  const [formData, setFormData] = useState({
    concepto: '',
    monto: '',
    categoria: '',
    frecuencia: 'Mensual' as CostoFijo['frecuencia'],
    fechaPago: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCosto) {
      setCostos(
        costos.map((c) =>
          c.id === editingCosto.id
            ? {
                ...c,
                ...formData,
                monto: parseFloat(formData.monto),
              }
            : c
        )
      );
    } else {
      const newCosto: CostoFijo = {
        id: String(Date.now()),
        ...formData,
        monto: parseFloat(formData.monto),
      };
      setCostos([...costos, newCosto]);
    }

    handleCloseModal();
  };

  const handleEdit = (costo: CostoFijo) => {
    setEditingCosto(costo);
    setFormData({
      concepto: costo.concepto,
      monto: String(costo.monto),
      categoria: costo.categoria,
      frecuencia: costo.frecuencia,
      fechaPago: costo.fechaPago,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setCostos(costos.filter((c) => c.id !== id));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCosto(null);
    setFormData({
      concepto: '',
      monto: '',
      categoria: '',
      frecuencia: 'Mensual',
      fechaPago: '',
    });
  };

  const totalMensual = costos
    .filter((c) => c.frecuencia === 'Mensual')
    .reduce((sum, c) => sum + c.monto, 0);

  const totalAnual = costos.reduce((sum, c) => {
    const multiplier =
      c.frecuencia === 'Mensual' ? 12 : c.frecuencia === 'Bimestral' ? 6 : c.frecuencia === 'Trimestral' ? 4 : 1;
    return sum + c.monto * multiplier;
  }, 0);

  const costosPorCategoria = costos.reduce((acc, costo) => {
    const multiplier =
      costo.frecuencia === 'Mensual' ? 12 : costo.frecuencia === 'Bimestral' ? 6 : costo.frecuencia === 'Trimestral' ? 4 : 1;
    const montoAnual = costo.monto * multiplier;

    const existing = acc.find((item) => item.categoria === costo.categoria);
    if (existing) {
      existing.monto += montoAnual;
    } else {
      acc.push({ categoria: costo.categoria, monto: montoAnual });
    }
    return acc;
  }, [] as { categoria: string; monto: number }[]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-1">Costos fijos</h1>
          <p className="text-muted-foreground">Gestiona tus gastos recurrentes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo costo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Total mensual</p>
          <p className="text-3xl">${totalMensual.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Total anual</p>
          <p className="text-3xl">${totalAnual.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Número de costos</p>
          <p className="text-3xl">{costos.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Costos List */}
        <div className="space-y-3">
          {costos.map((costo) => {
            const multiplier =
              costo.frecuencia === 'Mensual' ? 12 : costo.frecuencia === 'Bimestral' ? 6 : costo.frecuencia === 'Trimestral' ? 4 : 1;
            const montoAnual = costo.monto * multiplier;

            return (
              <motion.div
                key={costo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1">{costo.concepto}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>{costo.categoria}</span>
                      <span>•</span>
                      <span>{costo.frecuencia}</span>
                      <span>•</span>
                      <span>Pago día {costo.fechaPago}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(costo)}
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(costo.id)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Monto {costo.frecuencia.toLowerCase()}</p>
                    <p className="text-2xl">${costo.monto.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Anual</p>
                    <p className="text-lg">${montoAnual.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="mb-6">Distribución por categoría (anual)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costosPorCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ categoria, monto }) =>
                  `${categoria} $${(monto / 1000).toFixed(1)}k`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="monto"
              >
                {costosPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `$${value.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-border p-6 flex items-center justify-between">
                <h2>{editingCosto ? 'Editar costo' : 'Nuevo costo'}</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="concepto" className="block mb-2 text-sm">
                    Concepto *
                  </label>
                  <input
                    id="concepto"
                    type="text"
                    required
                    value={formData.concepto}
                    onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="categoria" className="block mb-2 text-sm">
                      Categoría *
                    </label>
                    <input
                      id="categoria"
                      type="text"
                      required
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                      placeholder="Ej: Servicios, Seguros"
                    />
                  </div>

                  <div>
                    <label htmlFor="monto" className="block mb-2 text-sm">
                      Monto *
                    </label>
                    <input
                      id="monto"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="frecuencia" className="block mb-2 text-sm">
                      Frecuencia *
                    </label>
                    <select
                      id="frecuencia"
                      value={formData.frecuencia}
                      onChange={(e) =>
                        setFormData({ ...formData, frecuencia: e.target.value as CostoFijo['frecuencia'] })
                      }
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    >
                      <option value="Mensual">Mensual</option>
                      <option value="Bimestral">Bimestral</option>
                      <option value="Trimestral">Trimestral</option>
                      <option value="Anual">Anual</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="fechaPago" className="block mb-2 text-sm">
                      Día de pago *
                    </label>
                    <input
                      id="fechaPago"
                      type="number"
                      required
                      min="1"
                      max="31"
                      value={formData.fechaPago}
                      onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                      placeholder="1-31"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {editingCosto ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
