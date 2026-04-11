import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  costoProduccion: number;
  descuento: number;
  stock: number;
  categoria: string;
}

const initialProductos: Producto[] = [
  {
    id: '1',
    nombre: 'Camisa de algodón',
    precio: 500,
    costoProduccion: 280,
    descuento: 0,
    stock: 145,
    categoria: 'Camisas',
  },
  {
    id: '2',
    nombre: 'Pantalón de mezclilla',
    precio: 850,
    costoProduccion: 520,
    descuento: 10,
    stock: 98,
    categoria: 'Pantalones',
  },
  {
    id: '3',
    nombre: 'Vestido floral',
    precio: 1200,
    costoProduccion: 680,
    descuento: 15,
    stock: 67,
    categoria: 'Vestidos',
  },
  {
    id: '4',
    nombre: 'Chaqueta de lana',
    precio: 1800,
    costoProduccion: 1100,
    descuento: 0,
    stock: 34,
    categoria: 'Chaquetas',
  },
  {
    id: '5',
    nombre: 'Blusa casual',
    precio: 450,
    costoProduccion: 240,
    descuento: 5,
    stock: 112,
    categoria: 'Blusas',
  },
];

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>(initialProductos);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    costoProduccion: '',
    descuento: '',
    stock: '',
    categoria: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProducto) {
      setProductos(
        productos.map((p) =>
          p.id === editingProducto.id
            ? {
                ...editingProducto,
                nombre: formData.nombre,
                precio: parseFloat(formData.precio),
                costoProduccion: parseFloat(formData.costoProduccion),
                descuento: parseFloat(formData.descuento),
                stock: parseFloat(formData.stock),
                categoria: formData.categoria,
              }
            : p
        )
      );
    } else {
      const newProducto: Producto = {
        id: String(Date.now()),
        nombre: formData.nombre,
        precio: parseFloat(formData.precio),
        costoProduccion: parseFloat(formData.costoProduccion),
        descuento: parseFloat(formData.descuento),
        stock: parseFloat(formData.stock),
        categoria: formData.categoria,
      };
      setProductos([...productos, newProducto]);
    }

    handleCloseModal();
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      precio: String(producto.precio),
      costoProduccion: String(producto.costoProduccion),
      descuento: String(producto.descuento),
      stock: String(producto.stock),
      categoria: producto.categoria,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setProductos(productos.filter((p) => p.id !== id));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProducto(null);
    setFormData({
      nombre: '',
      precio: '',
      costoProduccion: '',
      descuento: '',
      stock: '',
      categoria: '',
    });
  };

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calcularGanancia = (precio: number, costo: number, descuento: number) => {
    const precioFinal = precio * (1 - descuento / 100);
    return precioFinal - costo;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-1">Catálogo de productos</h1>
          <p className="text-muted-foreground">Gestiona tus productos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo producto
        </button>
      </div>

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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProductos.map((producto) => {
          const ganancia = calcularGanancia(producto.precio, producto.costoProduccion, producto.descuento);
          const precioFinal = producto.precio * (1 - producto.descuento / 100);

          return (
            <motion.div
              key={producto.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="mb-1">{producto.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{producto.categoria}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(producto)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(producto.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Precio</span>
                  <div className="text-right">
                    {producto.descuento > 0 ? (
                      <>
                        <span className="text-sm line-through text-muted-foreground mr-2">
                          ${producto.precio}
                        </span>
                        <span className="font-medium">${precioFinal.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-medium">${producto.precio}</span>
                    )}
                  </div>
                </div>

                {producto.descuento > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Descuento</span>
                    <span className="text-sm text-orange-600">{producto.descuento}% OFF</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Costo</span>
                  <span className="text-sm">${producto.costoProduccion}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ganancia</span>
                  <span className={`text-sm ${ganancia > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${ganancia.toFixed(2)}
                  </span>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Stock</span>
                    <span className={`font-medium ${producto.stock < 50 ? 'text-orange-600' : 'text-green-600'}`}>
                      {producto.stock} unidades
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredProductos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron productos
        </div>
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
                <h2>{editingProducto ? 'Editar producto' : 'Nuevo producto'}</h2>
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
                    Nombre del producto *
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
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="precio" className="block mb-2 text-sm">
                      Precio *
                    </label>
                    <input
                      id="precio"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="costoProduccion" className="block mb-2 text-sm">
                      Costo *
                    </label>
                    <input
                      id="costoProduccion"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.costoProduccion}
                      onChange={(e) => setFormData({ ...formData, costoProduccion: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="descuento" className="block mb-2 text-sm">
                      Descuento (%)
                    </label>
                    <input
                      id="descuento"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.descuento}
                      onChange={(e) => setFormData({ ...formData, descuento: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="stock" className="block mb-2 text-sm">
                      Stock *
                    </label>
                    <input
                      id="stock"
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>
                </div>

                {formData.precio && formData.costoProduccion && (
                  <div className="p-4 bg-accent rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Precio final</span>
                      <span>
                        ${(
                          parseFloat(formData.precio) *
                          (1 - parseFloat(formData.descuento || '0') / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ganancia por unidad</span>
                      <span
                        className={
                          parseFloat(formData.precio) *
                            (1 - parseFloat(formData.descuento || '0') / 100) -
                            parseFloat(formData.costoProduccion) >
                          0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        $
                        {(
                          parseFloat(formData.precio) *
                            (1 - parseFloat(formData.descuento || '0') / 100) -
                          parseFloat(formData.costoProduccion)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

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
                    {editingProducto ? 'Guardar' : 'Crear'}
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
