import { Building2, CheckCircle2, Server, Layout } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mini ERP + CRM Operations Portal</h1>
            <p className="text-slate-400 text-sm">Wholesale & Distribution Management System</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Layout className="w-5 h-5 text-emerald-400" />
              <span className="font-medium">Frontend Stack</span>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
              React + TS + Tailwind CSS
            </span>
          </div>

          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Server className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Backend Stack</span>
            </div>
            <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
              Node.js + Express + Prisma
            </span>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Phase 0: Project Initialization Complete</span>
          </div>
          <span className="text-xs text-slate-500">Fundsroom Technical Case Study</span>
        </div>
      </div>
    </div>
  );
}
