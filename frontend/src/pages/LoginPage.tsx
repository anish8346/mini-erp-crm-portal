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
    <div className="min-h-screen bg-[#FCF9F8] flex flex-col justify-center items-center p-4 sm:p-6 relative">
      {/* Card Container */}
      <div className="max-w-md w-full bg-white border border-[#E2E8E4] rounded-lg p-8 shadow-sm relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-[#4E635A] rounded text-white shadow-xs mb-3">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B1C1C]">Fundsroom ERP</h1>
          <p className="text-xs text-[#727875] mt-1">Wholesale & Distribution Operations Portal</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-[#FCE8E6] border border-[#FFDAD6] rounded flex items-start space-x-3 text-[#BA1A1A] text-xs">
            <AlertCircle className="w-4 h-4 text-[#BA1A1A] shrink-0 mt-0.5" />
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
        <div className="mt-8 pt-6 border-t border-[#E2E8E4]">
          <p className="text-[11px] font-medium text-[#727875] uppercase tracking-wider mb-3 text-center">
            Demo Credentials Selector
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPresetCredentials('admin@fundsroom.com')}
              className="p-2 rounded border border-[#E2E8E4] bg-[#F6F3F2] hover:bg-[#EAE7E7] text-[#1B1C1C] text-left transition-colors"
            >
              <div className="font-semibold text-[#1B1C1C]">ADMIN</div>
              <div className="text-[10px] text-[#727875]">admin@fundsroom.com</div>
            </button>

            <button
              type="button"
              onClick={() => setPresetCredentials('sales@fundsroom.com')}
              className="p-2 rounded border border-[#E2E8E4] bg-[#F6F3F2] hover:bg-[#EAE7E7] text-[#1B1C1C] text-left transition-colors"
            >
              <div className="font-semibold text-[#4E635A]">SALES</div>
              <div className="text-[10px] text-[#727875]">sales@fundsroom.com</div>
            </button>

            <button
              type="button"
              onClick={() => setPresetCredentials('warehouse@fundsroom.com')}
              className="p-2 rounded border border-[#E2E8E4] bg-[#F6F3F2] hover:bg-[#EAE7E7] text-[#1B1C1C] text-left transition-colors"
            >
              <div className="font-semibold text-[#7D562D]">WAREHOUSE</div>
              <div className="text-[10px] text-[#727875]">warehouse@fundsroom.com</div>
            </button>

            <button
              type="button"
              onClick={() => setPresetCredentials('accounts@fundsroom.com')}
              className="p-2 rounded border border-[#E2E8E4] bg-[#F6F3F2] hover:bg-[#EAE7E7] text-[#1B1C1C] text-left transition-colors"
            >
              <div className="font-semibold text-[#2D5A27]">ACCOUNTS</div>
              <div className="text-[10px] text-[#727875]">accounts@fundsroom.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

