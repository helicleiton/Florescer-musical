import React, { useState } from 'react';
// FIX: Use v8 namespaced API for authentication.
// import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { MusicalNoteIcon } from './icons/MusicalNoteIcon';

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // FIX: Use v8 namespaced API for authentication.
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('E-mail ou senha inválidos.');
      } else {
        setError('Ocorreu um erro. Tente novamente.');
      }
      console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-lg shadow-lg">
        <div className="text-center">
          <div className="inline-block p-3 mx-auto text-white rounded-full bg-primary">
            <MusicalNoteIcon className="w-8 h-8" />
          </div>
           <h1 className="mt-4 text-3xl font-bold text-on-surface">
            Florescer <span className="font-normal text-primary">Musical</span>
          </h1>
          <p className="mt-2 text-sm text-on-surface-secondary">
            Acesso ao painel de gerenciamento
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Endereço de E-mail
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>
          
          {error && (
              <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md">
                  {error}
              </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
