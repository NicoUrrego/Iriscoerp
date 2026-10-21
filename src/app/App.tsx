<<<<<<< HEAD
import { api, logout, type Session, type Module } from './api';
import { Toaster } from 'sonner';
import { lazy, Suspense, useEffect, useState } from "react";
=======
import { useState } from "react";
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Users,
  Wrench,
  Receipt,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Login from "./components/Login";
<<<<<<< HEAD

const Gastos=lazy(()=>import('./components/Gastos'));
const Usuarios=lazy(()=>import('./components/Usuarios'));
const Respaldo=lazy(()=>import('./components/Respaldo'));
const Dashboard=lazy(()=>import('./components/Dashboard'));
const Pedidos=lazy(()=>import('./components/Pedidos'));
const Productos=lazy(()=>import('./components/Productos'));
const Inventario=lazy(()=>import('./components/Inventario'));
const Finanzas=lazy(()=>import('./components/Finanzas'));
const Reportes=lazy(()=>import('./components/Reportes'));
const Empleados=lazy(()=>import('./components/Empleados'));
const Maquinaria=lazy(()=>import('./components/Maquinaria'));
const CostosFijos=lazy(()=>import('./components/CostosFijos'));
=======
import Dashboard from "./components/Dashboard";
import Pedidos from "./components/Pedidos";
import Productos from "./components/Productos";
import Inventario from "./components/Inventario";
import Finanzas from "./components/Finanzas";
import Reportes from "./components/Reportes";
import Empleados from "./components/Empleados";
import Maquinaria from "./components/Maquinaria";
import CostosFijos from "./components/CostosFijos";
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd

type View =
  | "dashboard"
  | "pedidos"
  | "productos"
  | "inventario"
  | "finanzas"
  | "reportes"
  | "empleados"
  | "maquinaria"
<<<<<<< HEAD
  | "costos" | "gastos" | "usuarios" | "backup";
=======
  | "costos";
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd

const navigation = [
  {
    id: "dashboard" as View,
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "pedidos" as View,
    name: "Pedidos",
    icon: ShoppingCart,
  },
  { id: "productos" as View, name: "Productos", icon: Package },
  {
    id: "inventario" as View,
    name: "Inventario",
    icon: Package,
  },
  {
    id: "finanzas" as View,
    name: "Finanzas",
    icon: DollarSign,
  },
  { id: "reportes" as View, name: "Reportes", icon: BarChart3 },
  { id: "empleados" as View, name: "Empleados", icon: Users },
  {
    id: "maquinaria" as View,
    name: "Maquinaria",
    icon: Wrench,
  },
  { id: "costos" as View, name: "Costos Fijos", icon: Receipt },
<<<<<<< HEAD
  {id:"gastos" as View,name:"Gastos",icon:Receipt},
  {id:"usuarios" as View,name:"Usuarios",icon:Users},
  {id:"backup" as View,name:"Respaldo",icon:Receipt},

];

export default function App() {
  const [session,setSession]=useState<Session|null>(null);
  const [ready,setReady]=useState(false);
=======
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
  const [currentView, setCurrentView] =
    useState<View>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

<<<<<<< HEAD
  const selectHome = (modules:Module[]) => (modules[0] === 'materiales' ? 'inventario' : modules[0]) as View;
  useEffect(()=>{
    api<Omit<Session,'token'>>('auth/me').then(s=>{setSession({...s,token:''});setCurrentView(selectHome(s.modules));}).catch(()=>{}).finally(()=>setReady(true));
    const expired=()=>{setSession(null);setMobileMenuOpen(false);};
    window.addEventListener('iris:session-expired',expired);
    navigator.storage?.persist?.().catch(()=>{});
    return()=>window.removeEventListener('iris:session-expired',expired);
  },[]);
  const handleLogin = (s:Session) => {setSession(s);setCurrentView(selectHome(s.modules));};
  const handleLogout = async () => {
    try {await logout();} finally {setSession(null);setCurrentView('dashboard');setMobileMenuOpen(false);}
  };
  if(!ready)return <p className="p-8" role="status">Abriendo Iris ERP SQLite…</p>;
  if(!session)return <Login onLogin={handleLogin}/>;
  const availableNavigation=navigation.filter(item=>session.modules.includes((item.id==='inventario'?'materiales':item.id) as Module));

  const renderView = () => {
    switch (currentView) {
      case "gastos": return <Gastos/>;
      case "usuarios": return <Usuarios/>;
      case "backup": return <Respaldo/>;
=======
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView("dashboard");
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
      case "dashboard":
        return <Dashboard />;
      case "pedidos":
        return <Pedidos />;
      case "productos":
<<<<<<< HEAD
        return <Productos readOnly={session.user.role === 'VENTAS'} />;
=======
        return <Productos />;
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
      case "inventario":
        return <Inventario />;
      case "finanzas":
        return <Finanzas />;
      case "reportes":
        return <Reportes />;
      case "empleados":
        return <Empleados />;
      case "maquinaria":
        return <Maquinaria />;
      case "costos":
        return <CostosFijos />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
<<<<<<< HEAD
      <Toaster richColors position="top-right"/>
=======
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-border bg-white">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl tracking-tight">Iris.co</h1>
          <p className="text-sm text-muted-foreground mt-1">
<<<<<<< HEAD
            Gestión textil · SQLite local
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {availableNavigation.map((item) => {
=======
            Gestión textil
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-40 flex items-center justify-between px-4">
        <h1 className="text-lg tracking-tight">Iris.co</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/20 z-30"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
              }}
<<<<<<< HEAD
              className="w-64 h-full bg-white border-r border-border flex flex-col pt-16"
=======
              className="w-64 h-full bg-white border-r border-border"
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <h1 className="text-xl tracking-tight">
                  Iris.co
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
<<<<<<< HEAD
                  Gestión textil · SQLite local
                </p>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {availableNavigation.map((item) => {
=======
                  Gestión textil
                </p>
              </div>

              <nav className="p-4 space-y-1">
                {navigation.map((item) => {
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-accent"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>

<<<<<<< HEAD
              <div className="p-4 border-t border-border">
=======
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-accent transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
<<<<<<< HEAD
            <Suspense fallback={<p className="p-8" role="status">Cargando módulo…</p>}>{renderView()}</Suspense>
=======
            {renderView()}
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
