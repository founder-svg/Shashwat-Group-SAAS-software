import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Boxes, 
  ArrowLeftRight, 
  HardDrive, 
  Settings2,
  FileText
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'Billing & Invoicing', icon: Receipt },
    { id: 'inventory', label: 'Stock Master (In/Out)', icon: Boxes },
    { id: 'transactions', label: 'Stock Movement Logs', icon: ArrowLeftRight },
    { id: 'drive', label: 'Cloud Drive (15 GB Free)', icon: HardDrive },
    { id: 'setup', label: 'Supabase Cloud Config', icon: Settings2 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shrink-0 shadow-lg min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </p>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cloud Storage & Size Guarantee Pill */}
      <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 text-xs">
        <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" /> Cloud Storage
          </span>
          <span className="text-emerald-400 font-bold">15 GB Free</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Micro-PDF mode: Bills strictly in KB (under 8 KB each). Over 1.8M bills capacity.
        </p>
      </div>
    </aside>
  );
}
