import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Maquina {
  id: string;
  nombre: string;
  tipo: string;
  estado: 'Activo' | 'Mantenimiento' | 'Reparación';
  ubicacion: string;
  ultimoMantenimiento: string;
  proximoMantenimiento: string;
  costoMantenimiento: number;
}

const initialMaquinas: Maquina[] = [
  {
    id: '1',
    nombre: 'Máquina de coser industrial 1',
    tipo: 'Costura',
    estado: 'Activo',
    ubicacion: 'Área de producción A',
    ultimoMantenimiento: '2026-03-15',
    proximoMantenimiento: '2026-06-15',
    costoMantenimiento: 1200,
  },
  {
    id: '2',
    nombre: 'Máquina de coser industrial 2',
    tipo: 'Costura',
    estado: 'Activo',
    ubicacion: 'Área de producción A',
    ultimoMantenimiento: '2026-03-20',
    proximoMantenimiento: '2026-06-20',
    costoMantenimiento: 1200,
  },
  {
    id: '3',
    nombre: 'Cortadora automática',
    tipo: 'Corte',
    estado: 'Mantenimiento',
    ubicacion: 'Área de corte',
    ultimoMantenimiento: '2026-04-05',
    proximoMantenimiento: '2026-07-05',
    costoMantenimiento: 2500,
  },
  {
    id: '4',
    nombre: 'Plancha industrial',
    tipo: 'Acabado',
    estado: 'Activo',
    ubicacion: 'Área de acabado',
    ultimoMantenimiento: '2026-02-28',
    proximoMantenimiento: '2026-05-28',
    costoMantenimiento: 800,
  },
  {
    id: '5',
    nombre: 'Overlock',
    tipo: 'Costura',
    estado: 'Activo',
    ubicacion: 'Área de producción B',
    ultimoMantenimiento: '2026-03-10',
    proximoMantenimiento: '2026-06-10',
    costoMantenimiento: 900,
  },
];

export default function Maquinaria() {
  const [maquinas, setMaquinas] = useState<Maquina[]>(initialMaquinas);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaquina, setEditingMaquina] = useState<Maquina | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    estado: 'Activo' as Maquina['estado'],
    ubicacion: '',
    ultimoMantenimiento: '',
    proximoMantenimiento: '',
    costoMantenimiento: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMaquina) {
      setMaquinas(
        maquinas.map((m) =>
          m.id === editingMaquina.id
            ? {
                ...m,
                ...formData,
                costoMantenimiento: parseFloat(formData.costoMantenimiento),
              }
            : m
        )
      );
    } else {
      const newMaquina: Maquina = {
        id: String(Date.now()),
        ...formData,
        costoMantenimiento: parseFloat(formData.costoMantenimiento),
      };
      setMaquinas([...maquinas, newMaquina]);
    }

    handleCloseModal();
  };

  const handleEdit = (maquina: Maquina) => {
    setEditingMaquina(maquina);
    setFormData({
      nombre: maquina.nombre,
      tipo: maquina.tipo,
      estado: maquina.estado,
      ubicacion: maquina.ubicacion,
      ultimoMantenimiento: maquina.ultimoMantenimiento,
      proximoMantenimiento: maquina.proximoMantenimiento,
      costoMantenimiento: String(maquina.costoMantenimiento),
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setMaquinas(maquinas.filter((m) => m.id !== id));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMaquina(null);
    setFormData({
      nombre: '',
      tipo: '',
      estado: 'Activo',
      ubicacion: '',
      ultimoMantenimiento: '',
      proximoMantenimiento: '',
      costoMantenimiento: '',
    });
  };

  const filteredMaquinas = maquinas.filter(
    (maq) =>
      maq.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maq.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maquinasActivas = maquinas.filter((m) => m.estado === 'Activo').length;
  const totalCostoMantenimiento = maquinas.reduce((sum, m) => sum + m.costoMantenimiento, 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-1">Maquinaria y herramientas</h1>
          <p className="text-muted-foreground">Control de activos y mantenimiento</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva máquina
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Total de máquinas</p>
          <p className="text-3xl">{maquinas.length}</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Máquinas activas</p>
          <p className="text-3xl text-green-600">{maquinasActivas}</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Costo mantenimiento</p>
          <p className="text-3xl">${totalCostoMantenimiento.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:border-ring"
          />
        </div>
      </div>

      {/* Maquinas List */}
      <div className="space-y-3">
        {filteredMaquinas.map((maquina) => {
          const diasProximoMantenimiento = Math.ceil(
            (new Date(maquina.proximoMantenimiento).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );

          return (
            <motion.div
              key={maquina.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      maquina.estado === 'Activo'
                        ? 'bg-green-50 text-green-600'
                        : maquina.estado === 'Mantenimiento'
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {maquina.estado === 'Activo' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : maquina.estado === 'Mantenimiento' ? (
                      <Wrench className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1">{maquina.nombre}</h3>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="text-muted-foreground">{maquina.tipo}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{maquina.ubicacion}</span>
                      <span className="text-muted-foreground">•</span>
                      <span
                        className={`${
                          maquina.estado === 'Activo'
                            ? 'text-green-600'
                            : maquina.estado === 'Mantenimiento'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {maquina.estado}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(maquina)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(maquina.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Último mantenimiento</p>
                  <p>{maquina.ultimoMantenimiento}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Próximo mantenimiento</p>
                  <p className={diasProximoMantenimiento <= 30 ? 'text-yellow-600' : ''}>
                    {maquina.proximoMantenimiento}
                    {diasProximoMantenimiento <= 30 && (
                      <span className="ml-2 text-xs">({diasProximoMantenimiento}d)</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Costo mantenimiento</p>
                  <p>${maquina.costoMantenimiento.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredMaquinas.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No se encontraron máquinas</div>
      )}

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
                <h2>{editingMaquina ? 'Editar máquina' : 'Nueva máquina'}</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="nombre" className="block mb-2 text-sm">
                    Nombre de la máquina *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tipo" className="block mb-2 text-sm">
                      Tipo *
                    </label>
                    <input
                      id="tipo"
                      type="text"
                      required
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="estado" className="block mb-2 text-sm">
                      Estado *
                    </label>
                    <select
                      id="estado"
                      value={formData.estado}
                      onChange={(e) =>
                        setFormData({ ...formData, estado: e.target.value as Maquina['estado'] })
                      }
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Reparación">Reparación</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="ubicacion" className="block mb-2 text-sm">
                    Ubicación *
                  </label>
                  <input
                    id="ubicacion"
                    type="text"
                    required
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ultimoMantenimiento" className="block mb-2 text-sm">
                      Último mantenimiento *
                    </label>
                    <input
                      id="ultimoMantenimiento"
                      type="date"
                      required
                      value={formData.ultimoMantenimiento}
                      onChange={(e) =>
                        setFormData({ ...formData, ultimoMantenimiento: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="proximoMantenimiento" className="block mb-2 text-sm">
                      Próximo mantenimiento *
                    </label>
                    <input
                      id="proximoMantenimiento"
                      type="date"
                      required
                      value={formData.proximoMantenimiento}
                      onChange={(e) =>
                        setFormData({ ...formData, proximoMantenimiento: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="costoMantenimiento" className="block mb-2 text-sm">
                    Costo de mantenimiento *
                  </label>
                  <input
                    id="costoMantenimiento"
                    type="number"
                    required
                    min="0"
                    value={formData.costoMantenimiento}
                    onChange={(e) => setFormData({ ...formData, costoMantenimiento: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                  />
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
                    {editingMaquina ? 'Guardar' : 'Crear'}
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
