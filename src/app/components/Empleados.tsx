import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Empleado {
  id: string;
  nombre: string;
  rol: string;
  salario: number;
  horario: string;
  telefono: string;
  email: string;
  fechaIngreso: string;
}

const initialEmpleados: Empleado[] = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    rol: 'Cortador',
    salario: 8000,
    horario: 'Lun-Vie 8:00-17:00',
    telefono: '555-1001',
    email: 'juan@iris.co',
    fechaIngreso: '2024-01-15',
  },
  {
    id: '2',
    nombre: 'María García',
    rol: 'Costurera',
    salario: 7500,
    horario: 'Lun-Vie 8:00-17:00',
    telefono: '555-1002',
    email: 'maria@iris.co',
    fechaIngreso: '2024-03-10',
  },
  {
    id: '3',
    nombre: 'Carlos López',
    rol: 'Diseñador',
    salario: 10000,
    horario: 'Lun-Vie 9:00-18:00',
    telefono: '555-1003',
    email: 'carlos@iris.co',
    fechaIngreso: '2023-11-20',
  },
  {
    id: '4',
    nombre: 'Ana Martínez',
    rol: 'Control de calidad',
    salario: 7000,
    horario: 'Lun-Vie 8:00-17:00',
    telefono: '555-1004',
    email: 'ana@iris.co',
    fechaIngreso: '2024-02-05',
  },
];

export default function Empleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>(initialEmpleados);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    rol: '',
    salario: '',
    horario: '',
    telefono: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEmpleado) {
      setEmpleados(
        empleados.map((emp) =>
          emp.id === editingEmpleado.id
            ? {
                ...emp,
                ...formData,
                salario: parseFloat(formData.salario),
              }
            : emp
        )
      );
    } else {
      const newEmpleado: Empleado = {
        id: String(Date.now()),
        ...formData,
        salario: parseFloat(formData.salario),
        fechaIngreso: new Date().toISOString().split('T')[0],
      };
      setEmpleados([...empleados, newEmpleado]);
    }

    handleCloseModal();
  };

  const handleEdit = (empleado: Empleado) => {
    setEditingEmpleado(empleado);
    setFormData({
      nombre: empleado.nombre,
      rol: empleado.rol,
      salario: String(empleado.salario),
      horario: empleado.horario,
      telefono: empleado.telefono,
      email: empleado.email,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setEmpleados(empleados.filter((emp) => emp.id !== id));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmpleado(null);
    setFormData({
      nombre: '',
      rol: '',
      salario: '',
      horario: '',
      telefono: '',
      email: '',
    });
  };

  const filteredEmpleados = empleados.filter(
    (emp) =>
      emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalNomina = empleados.reduce((sum, emp) => sum + emp.salario, 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-1">Empleados</h1>
          <p className="text-muted-foreground">Gestiona tu equipo de trabajo</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo empleado
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Total empleados</p>
          <p className="text-3xl">{empleados.length}</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Nómina mensual</p>
          <p className="text-3xl">${totalNomina.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-2">Salario promedio</p>
          <p className="text-3xl">${(totalNomina / empleados.length).toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:border-ring"
          />
        </div>
      </div>

      {/* Empleados Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEmpleados.map((empleado) => (
          <motion.div
            key={empleado.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-border rounded-xl p-5"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 truncate">{empleado.nombre}</h3>
                <p className="text-sm text-muted-foreground">{empleado.rol}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleEdit(empleado)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(empleado.id)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Salario</span>
                <span className="font-medium">${empleado.salario.toLocaleString()}/mes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Horario</span>
                <span>{empleado.horario}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Teléfono</span>
                <span>{empleado.telefono}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="truncate ml-2">{empleado.email}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Ingreso</span>
                <span>{empleado.fechaIngreso}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredEmpleados.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No se encontraron empleados</div>
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
                <h2>{editingEmpleado ? 'Editar empleado' : 'Nuevo empleado'}</h2>
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
                    Nombre completo *
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
                    <label htmlFor="rol" className="block mb-2 text-sm">
                      Rol *
                    </label>
                    <input
                      id="rol"
                      type="text"
                      required
                      value={formData.rol}
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="salario" className="block mb-2 text-sm">
                      Salario mensual *
                    </label>
                    <input
                      id="salario"
                      type="number"
                      required
                      min="0"
                      value={formData.salario}
                      onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="horario" className="block mb-2 text-sm">
                    Horario *
                  </label>
                  <input
                    id="horario"
                    type="text"
                    required
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
                    placeholder="Ej: Lun-Vie 8:00-17:00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none"
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
                    {editingEmpleado ? 'Guardar' : 'Crear'}
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
