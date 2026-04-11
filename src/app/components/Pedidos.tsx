import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Pedido {
  id: string;
  cliente: string;
  telefono: string;
  email: string;
  direccion: string;
  productos: string;
  cantidad: number;
  total: number;
  formaPago: string;
  estado: 'Pendiente' | 'En proceso' | 'Completado';
  fecha: string;
}

const initialPedidos: Pedido[] = [
  {
    id: '1234',
    cliente: 'María González',
    telefono: '555-0101',
    email: 'maria@email.com',
    direccion: 'Calle Principal 123',
    productos: 'Camisas',
    cantidad: 25,
    total: 12500,
    formaPago: 'Transferencia',
    estado: 'Completado',
    fecha: '2026-04-05',
  },
  {
    id: '1235',
    cliente: 'Carlos Ramírez',
    telefono: '555-0102',
    email: 'carlos@email.com',
    direccion: 'Avenida Norte 456',
    productos: 'Pantalones',
    cantidad: 15,
    total: 8900,
    formaPago: 'Efectivo',
    estado: 'En proceso',
    fecha: '2026-04-08',
  },
  {
    id: '1236',
    cliente: 'Ana López',
    telefono: '555-0103',
    email: 'ana@email.com',
    direccion: 'Boulevard Sur 789',
    productos: 'Vestidos',
    cantidad: 30,
    total: 15200,
    formaPago: 'Tarjeta',
    estado: 'Pendiente',
    fecha: '2026-04-10',
  },
];

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>(initialPedidos);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    email: '',
    direccion: '',
    productos: '',
    cantidad: '',
    precioUnitario: '',
    formaPago: 'Efectivo',
    estado: 'Pendiente' as Pedido['estado'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const total = parseFloat(formData.cantidad) * parseFloat(formData.precioUnitario);

    if (editingPedido) {
      setPedidos(
        pedidos.map((p) =>
          p.id === editingPedido.id
            ? {
                ...editingPedido,
                ...formData,
                cantidad: parseFloat(formData.cantidad),
                total,
              }
            : p
        )
      );
    } else {
      const newPedido: Pedido = {
        id: String(Math.floor(1000 + Math.random() * 9000)),
        ...formData,
        cantidad: parseFloat(formData.cantidad),
        total,
        fecha: new Date().toISOString().split('T')[0],
      };
      setPedidos([newPedido, ...pedidos]);
    }

    handleCloseModal();
  };

  const handleEdit = (pedido: Pedido) => {
    setEditingPedido(pedido);
    setFormData({
      cliente: pedido.cliente,
      telefono: pedido.telefono,
      email: pedido.email,
      direccion: pedido.direccion,
      productos: pedido.productos,
      cantidad: String(pedido.cantidad),
      precioUnitario: String(pedido.total / pedido.cantidad),
      formaPago: pedido.formaPago,
      estado: pedido.estado,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setPedidos(pedidos.filter((p) => p.id !== id));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPedido(null);
    setFormData({
      cliente: '',
      telefono: '',
      email: '',
      direccion: '',
      productos: '',
      cantidad: '',
      precioUnitario: '',
      formaPago: 'Efectivo',
      estado: 'Pendiente',
    });
  };

  const filteredPedidos = pedidos.filter((pedido) =>
    pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pedido.id.includes(searchTerm) ||
    pedido.productos.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-1">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona tus pedidos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo pedido
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente, ID o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:border-ring"
          />
        </div>
      </div>

      {/* Pedidos List */}
      <div className="space-y-3">
        {filteredPedidos.map((pedido) => (
          <motion.div
            key={pedido.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-border rounded-xl p-4 md:p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3>{pedido.cliente}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <p>ID: #{pedido.id}</p>
                  <p>Tel: {pedido.telefono}</p>
                  <p>Producto: {pedido.productos}</p>
                  <p>Cantidad: {pedido.cantidad}</p>
                  <p>Pago: {pedido.formaPago}</p>
                  <p>Fecha: {pedido.fecha}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 md:flex-col md:items-end">
                <div className="flex-1 md:flex-none">
                  <p className="text-2xl">${pedido.total.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pedido)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(pedido.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPedidos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron pedidos
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
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
                <h2>{editingPedido ? 'Editar pedido' : 'Nuevo pedido'}</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cliente" className="block mb-2 text-sm">
                      Cliente *
                    </label>
                    <input
                      id="cliente"
                      type="text"
                      required
                      value={formData.cliente}
                      onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="telefono" className="block mb-2 text-sm">
                      Teléfono *
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      required
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="direccion" className="block mb-2 text-sm">
                      Dirección
                    </label>
                    <input
                      id="direccion"
                      type="text"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="productos" className="block mb-2 text-sm">
                      Producto *
                    </label>
                    <input
                      id="productos"
                      type="text"
                      required
                      value={formData.productos}
                      onChange={(e) => setFormData({ ...formData, productos: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="cantidad" className="block mb-2 text-sm">
                      Cantidad *
                    </label>
                    <input
                      id="cantidad"
                      type="number"
                      required
                      min="1"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="precioUnitario" className="block mb-2 text-sm">
                      Precio unitario *
                    </label>
                    <input
                      id="precioUnitario"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.precioUnitario}
                      onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="formaPago" className="block mb-2 text-sm">
                      Forma de pago
                    </label>
                    <select
                      id="formaPago"
                      value={formData.formaPago}
                      onChange={(e) => setFormData({ ...formData, formaPago: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Transferencia">Transferencia</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="estado" className="block mb-2 text-sm">
                      Estado
                    </label>
                    <select
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as Pedido['estado'] })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En proceso">En proceso</option>
                      <option value="Completado">Completado</option>
                    </select>
                  </div>
                </div>

                {formData.cantidad && formData.precioUnitario && (
                  <div className="p-4 bg-accent rounded-lg">
                    <p className="text-sm text-muted-foreground">Total del pedido</p>
                    <p className="text-2xl">
                      ${(parseFloat(formData.cantidad) * parseFloat(formData.precioUnitario)).toLocaleString()}
                    </p>
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
                    {editingPedido ? 'Guardar cambios' : 'Crear pedido'}
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
