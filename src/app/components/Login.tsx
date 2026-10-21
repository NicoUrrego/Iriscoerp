<<<<<<< HEAD
import { api, login, errorMessage, type Session } from '../api';
import { useEffect, useState } from 'react';
=======
import { useState } from 'react';
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

interface LoginProps {
<<<<<<< HEAD
  onLogin: (session:Session) => void;
=======
  onLogin: () => void;
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
<<<<<<< HEAD
  const [setup,setSetup]=useState(false);
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  useEffect(()=>{api<{required:boolean}>('auth/setup').then(r=>{setSetup(r.required);setIsRegister(r.required);setReady(true);}).catch(e=>setError(errorMessage(e)));},[]);
  const [formData, setFormData] = useState({
    username: '', email: '',
=======
  const [formData, setFormData] = useState({
    username: '',
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

<<<<<<< HEAD
  const handleSubmit = async (e: React.FormEvent) => {
=======
  const handleSubmit = (e: React.FormEvent) => {
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (isRegister && formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

<<<<<<< HEAD
    setBusy(true);
    try {
      if(isRegister) { await api('auth/register','POST',{...formData,role:'ADMIN'}); setSetup(false);setIsRegister(false); }
      onLogin(await login(formData.username,formData.password));
    } catch(e) {setError(errorMessage(e));} finally {setBusy(false);}

=======
    onLogin();
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl tracking-tight mb-2">Iris.co</h1>
            <p className="text-muted-foreground">Sistema de gestión textil</p>
<<<<<<< HEAD
            {import.meta.env.MODE === 'demo' && <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-950" role="note">
              <strong>Iris ERP Demo · datos ficticios</strong>
              <p>Usuario: admin.demo</p>
              <p>Contraseña: IrisDemo2026!</p>
              <p className="mt-2">Otros perfiles: ventas.demo e inventario.demo, con la misma contraseña.</p>
            </div>}
=======
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block mb-2 text-sm">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none transition-colors"
                placeholder="Tu usuario"
              />
            </div>

<<<<<<< HEAD
            {isRegister && <div><label htmlFor="email" className="block mb-2 text-sm">Correo</label><input id="email" type="email" required value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} className="w-full px-4 py-3 bg-input-background rounded-lg border border-border" /></div>}
=======
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
            <div>
              <label htmlFor="password" className="block mb-2 text-sm">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none transition-colors"
                placeholder="Tu contraseña"
              />
            </div>

            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="confirmPassword" className="block mb-2 text-sm">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-transparent focus:border-ring focus:outline-none transition-colors"
                  placeholder="Confirma tu contraseña"
                />
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
<<<<<<< HEAD
              type="submit" disabled={busy || !ready}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {busy ? 'Procesando…' : isRegister ? 'Crear cuenta administradora' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">{setup?'Primera apertura: crea el administrador de este dispositivo.':'Las demás cuentas se crean desde el módulo Usuarios de ADMIN.'}</p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          SQLite local · La primera cuenta es ADMIN · Contraseña de al menos 8 caracteres
=======
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {isRegister ? 'Registrarse' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setFormData({ username: '', password: '', confirmPassword: '' });
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Demo: ingresa cualquier usuario y contraseña
>>>>>>> a64f0fbfb2565319db6dac2dd0581b3cae6c32fd
        </p>
      </motion.div>
    </div>
  );
}
