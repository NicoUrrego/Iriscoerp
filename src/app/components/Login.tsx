import { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
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

    onLogin();
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
        </p>
      </motion.div>
    </div>
  );
}
