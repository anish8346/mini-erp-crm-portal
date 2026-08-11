import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('admin@fundsroom.com');
  const [password, setPassword] = useState<string>('Password@123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const setPresetCredentials = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorator */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Container */}
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3.5 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">Fundsroom ERP</h1>
          <p className="text-xs text-slate-400 mt-1">Wholesale & Distribution Operations Portal</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-950/40 border border-rose-800/50 rounded-xl flex items-start space-x-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@fundsroom.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Portal
          </Button>
        </form>

        {/* Quick Credentials Test Selector */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
            Demo Credentials Selector
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPresetCredentials('admin@fundsroom.com')}
              className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300 text-left transition-colors"
            >
              <div className="font-semibold text-purple-400">ADMIN</div>
              <div className="text-[10px] text-slate-500">admin@fundsroom.com</div>
            </button>

            <button
              type="button"
              onClick={() => setPresetCredentials('sales@fundsroom.com')}
              className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300 text-left transition-colors"
            >
              <div className="font-semibold text-blue-400">SALES</div>
              <div className="text-[10px] text-slate-500">sales@fundsroom.com</div>
            </button>

            <button
              type="button"
              onClick={() => setPresetCredentials('warehouse@fundsroom.com')}
              className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300 text-left transition-colors"
            >
              <div className="font-semibold text-amber-400">WAREHOUSE</div>
              <div className="text-[10px] text-slate-500">warehouse@fundsroom.com</div>
            </button>

            <button
              type="button"
              onClick={() => setPresetCredentials('accounts@fundsroom.com')}
              className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300 text-left transition-colors"
            >
              <div className="font-semibold text-emerald-400">ACCOUNTS</div>
              <div className="text-[10px] text-slate-500">accounts@fundsroom.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
