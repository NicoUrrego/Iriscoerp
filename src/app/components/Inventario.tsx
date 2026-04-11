import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Material {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  stockMinimo: number;
  categoria: string;
  ultimaCompra: string;
}

const initialMateriales: Material[] = [
  {
    id: '1',
    nombre: 'Tela de algodón',
    cantidad: 450,
    unidad: 'metros',
    stockMinimo: 200,
    categoria: 'Telas',
    ultimaCompra: '2026-04-01',
  },
  {
    id: '2',
    nombre: 'Tela de mezclilla',
    cantidad: 180,
    unidad: 'metros',
    stockMinimo: 150,
    categoria: 'Telas',
    ultimaCompra: '2026-03-28',
  },
  {
    id: '3',
    nombre: 'Hilo blanco',
    cantidad: 85,
    unidad: 'carretes',
    stockMinimo: 100,
    categoria: 'Hilos',
    ultimaCompra: '2026-03-15',
  },
  {
    id: '4',
    nombre: 'Botones',
    cantidad: 2500,
    unidad: 'unidades',
    stockMinimo: 1000,
    categoria: 'Accesorios',
    ultimaCompra: '2026-04-05',
  },
  {
    id: '5',
    nombre: 'Cremalleras',
    cantidad: 340,
    unidad: 'unidades',
    stockMinimo: 200,
    categoria: 'Accesorios',
    ultimaCompra: '2026-03-20',
  },
];

export default function Inventario() {
  const [materiales, setMateriales] = useState<Material[]>(initialMateriales);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    cantidad: '',
    unidad: 'metros',
    stockMinimo: '',
    categoria: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMaterial) {
      setMateriales(
        materiales.map((m) =>
          m.id === editingMaterial.id
            ? {
                ...m,
                nombre: formData.nombre,
                cantidad: parseFloat(formData.cantidad),
                unidad: formData.unidad,
                stockMinimo: parseFloat(formData.stockMinimo),
                categoria: formData.categoria,
              }
            : m
        )
      );
    } else {
      const newMaterial: Material = {
        id: String(Date.now()),
        nombre: formData.nombre,
        cantidad: parseFloat(formData.cantidad),
        unidad: formData.unidad,
        stockMinimo: parseFloat(formData.stockMinimo),
        categoria: formData.categoria,
        ultimaCompra: new Date().toISOString().split('T')[0],
      };
      setMateriales([...materiales, newMaterial]);
    }

    handleCloseModal();
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      nombre: material.nombre,
      cantidad: String(material.cantidad),
      unidad: material.unidad,
      stockMinimo: String(material.stockMinimo),
      categoria: material.categoria,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setMateriales(materiales.filter((m) => m.id !== id));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMaterial(null);
    setFormData({
      nombre: '',
      cantidad: '',
      unidad: 'metros',
      stockMinimo: '',
      categoria: '',
    });
  };

  const filteredMateriales = materiales.filter(
    (material) =>
      material.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const materialesBajoStock = materiales.filter((m) => m.cantidad <= m.stockMinimo);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-1">Inventario</h1>
          <p className="text-muted-foreground">Gestiona tus materias primas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo material
        </button>
      </div>

      {/* Alertas de bajo stock */}
      {materialesBajoStock.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900 mb-1">
                {materialesBajoStock.length} material(es) con stock bajo
              </p>
              <p className="text-sm text-yellow-700">
                {materialesBajoStock.map((m) => m.nombre).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:border-ring"
          />
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-3">
        {filteredMateriales.map((material) => {
          const isBajoStock = material.cantidad <= material.stockMinimo;
          const porcentajeStock = (material.cantidad / material.stockMinimo) * 100;

          return (
            <motion.div
              key={material.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`bg-white border rounded-xl p-5 ${
                isBajoStock ? 'border-yellow-300' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3>{material.nombre}</h3>
                    {isBajoStock && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{material.categoria}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(material)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cantidad actual</p>
                  <p className="text-xl">
                    {material.cantidad} {material.unidad}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Stock mínimo</p>
                  <p className="text-lg">
                    {material.stockMinimo} {material.unidad}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estado</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          porcentajeStock > 100
                            ? 'bg-green-500'
                            : porcentajeStock > 50
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(porcentajeStock, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm">{porcentajeStock.toFixed(0)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Última compra</p>
                  <p className="text-sm">{material.ultimaCompra}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredMateriales.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No se encontraron materiales</div>
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
                <h2>{editingMaterial ? 'Editar material' : 'Nuevo material'}</h2>
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
                    Nombre del material *
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
                    placeholder="Ej: Telas, Hilos, Accesorios"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cantidad" className="block mb-2 text-sm">
                      Cantidad *
                    </label>
                    <input
                      id="cantidad"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="unidad" className="block mb-2 text-sm">
                      Unidad *
                    </label>
                    <select
                      id="unidad"
                      value={formData.unidad}
                      onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    >
                      <option value="metros">Metros</option>
                      <option value="kilogramos">Kilogramos</option>
                      <option value="unidades">Unidades</option>
                      <option value="carretes">Carretes</option>
                      <option value="rollos">Rollos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="stockMinimo" className="block mb-2 text-sm">
                    Stock mínimo *
                  </label>
                  <input
                    id="stockMinimo"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.stockMinimo}
                    onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
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
                    {editingMaterial ? 'Guardar' : 'Crear'}
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
