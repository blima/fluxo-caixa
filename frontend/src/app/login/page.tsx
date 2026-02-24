'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      toast.success('Login realizado com sucesso!');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Credenciais inválidas',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary-50 p-4 rounded-2xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="h-16 w-16" fill="none">
                {/* Moeda traseira */}
                <ellipse cx="26" cy="32" rx="14" ry="14" className="fill-primary-200" />
                <ellipse cx="26" cy="32" rx="10" ry="10" className="fill-primary-100" />
                <text x="26" y="37" textAnchor="middle" className="fill-primary-700" fontSize="14" fontWeight="bold">$</text>
                {/* Seta de fluxo */}
                <path d="M38 22 L50 16 L48 24 Z" className="fill-primary-500" />
                <path d="M32 28 Q40 20 50 16" className="stroke-primary-500" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M38 42 L50 48 L48 40 Z" className="fill-primary-400" />
                <path d="M32 36 Q40 44 50 48" className="stroke-primary-400" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Barras de gráfico */}
                <rect x="52" y="28" width="4" height="16" rx="1" className="fill-primary-300" />
                <rect x="58" y="22" width="4" height="22" rx="1" className="fill-primary-600" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Fluxo de Caixa</h1>
            <p className="text-sm text-gray-500 mt-1">
              Faça login para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label-field">Senha</label>
              <input
                type="password"
                className="input-field"
                placeholder="********"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            Controle financeiro simplificado
          </p>
        </div>
      </div>
    </div>
  );
}
