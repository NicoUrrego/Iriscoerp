import { useRecords } from '../hooks/useRecords';
import {errorMessage} from '../api';
import {toast} from 'sonner';
import type { Order as Pedido, Product } from '../../backend';
import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';





export default function Pedidos() {
  const {records:pedidos,save,remove,busy,error,loading}=useRecords<Pedido>('pedidos');
  const {records:products,reload:reloadProducts}=useRecords<Product>('productos');
  const [items,setItems]=useState<{productoId:string;cantidad:number}[]>([{productoId:'',cantidad:1}]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    email: '',
    direccion: '',
    formaPago: 'Efectivo',
    estado: 'Pendiente' as Pedido['estado'],
  });

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    if(await save({...formData,items},editingPedido?.id)) {handleCloseModal();reloadProducts().catch(e=>toast.error(errorMessage(e)));}
  };

  const handleEdit = (pedido: Pedido) => {
    setEditingPedido(pedido);
    setItems(pedido.items.map(i=>({productoId:i.productoId,cantidad:i.cantidad})));
    setFormData({
      cliente: pedido.cliente,
      telefono: pedido.telefono,
      email: pedido.email,
      direccion: pedido.direccion,
      formaPago: pedido.formaPago,
      estado: pedido.estado,
    });
    setShowModal(true);
  };

  const handleDelete = async (id:string) => { if(await remove(id)) reloadProducts().catch(e=>toast.error(errorMessage(e))); };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPedido(null);
    setItems([{productoId:'',cantidad:1}]);
    setFormData({
      cliente: '',
      telefono: '',
      email: '',
      direccion: '',
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
      {loading && <p role="status">Cargando pedidos…</p>}
      {error && <p role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg">{error}</p>}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-1">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona tus pedidos</p>
        </div>
        <button
          disabled={busy}
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
          disabled={busy}
                    onClick={() => handleEdit(pedido)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
          disabled={busy}
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
          disabled={busy}
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && <p role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg">{error}</p>}
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

                <div className="space-y-3">
                  <h3>Productos del pedido</h3>
                  {items.map((item,index)=><div key={index} className="flex flex-wrap gap-2 items-center">
                    <select aria-label={'Producto '+(index+1)} required value={item.productoId} onChange={e=>setItems(items.map((x,j)=>j===index?{...x,productoId:e.target.value}:x))} className="flex-1 min-w-40 p-2 border border-border rounded-lg">
                      <option value="">Selecciona un producto</option>
                      {products.map(p=><option key={p.id} value={p.id}>{p.nombre} · ${p.precio} · {p.descuento}% descuento · stock {p.stock}</option>)}
                    </select>
                    <input aria-label={'Cantidad '+(index+1)} type="number" min="1" step="1" required value={item.cantidad} onChange={e=>setItems(items.map((x,j)=>j===index?{...x,cantidad:Number(e.target.value)}:x))} className="w-20 p-2 border border-border rounded-lg"/>
                    <button type="button" onClick={()=>setItems(items.filter((_,j)=>j!==index))} className="p-2 text-red-600">Quitar</button>
                  </div>)}
                  <button type="button" onClick={()=>setItems([...items,{productoId:'',cantidad:1}])} className="px-3 py-2 border border-border rounded-lg">Añadir producto</button>
                  <p>Total con descuentos: <strong>${items.reduce((s,i)=>{const p=editingPedido?.items.find(p=>p.productoId===i.productoId)??products.find(p=>p.id===i.productoId);return s+(p?Math.round(p.precio*100*i.cantidad*(1-p.descuento/100))/100:0);},0).toLocaleString('es-CO')}</strong></p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
          disabled={busy}
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
          disabled={busy}
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
