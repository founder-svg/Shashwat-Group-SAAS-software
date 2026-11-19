import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Receipt, 
  Boxes, 
  Database, 
  History,
  Building2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { SHASHWAT_WOODS_LOGO, SHASHWAT_ASHAPURA_WOODS_LOGO } from '../constants/firmLogos';

export default function Sidebar({ activeTab, setActiveTab, firm }) {
  const modules = [
    { id: 'dashboard', number: '1', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', number: '2', label: 'Product Management', icon: Package },
    { id: 'vehicles', number: '3', label: 'Vehicle Management', icon: Truck },
    { id: 'billing', number: '4', label: 'Invoice Bill', icon: Receipt },
    { id: 'inventory', number: '5', label: 'Inventory Management', icon: Boxes },
    { id: 'data', number: '6', label: 'DATA', icon: Database },
    { id: 'history', number: '7', label: 'History', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-950/70 backdrop-blur-2xl text-slate-300 flex flex-col justify-between shrink-0 shadow-2xl min-h-[calc(100vh-61px)] border-r border-white/10">
      <div>
        {/* Top Left: Active Division / Firm Branding */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-slate-700/80 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              <img
                src={firm?.logo || (firm?.id === 'shashwat_ashapura_woods' ? SHASHWAT_ASHAPURA_WOODS_LOGO : SHASHWAT_WOODS_LOGO)}
                alt={firm?.name || 'Firm Logo'}
                onError={(e) => {
                  e.currentTarget.src = firm?.id === 'shashwat_ashapura_woods' ? SHASHWAT_ASHAPURA_WOODS_LOGO : SHASHWAT_WOODS_LOGO;
                }}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="overflow-hidden">
              <span className="block text-[10px] font-mono font-bold text-amber-400 tracking-wider uppercase truncate">
                {firm?.shortName || 'SHASHWAT'} DIVISION
              </span>
              <h2 className="text-xs font-black text-white tracking-tight truncate uppercase">
                {firm?.name || 'SHASHWAT GROUP'}
              </h2>
              <p className="text-[10px] text-slate-400 truncate">
                {firm?.motto || 'Commercial SaaS ERP'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Section Header */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Operations Menu
          </p>
        </div>

        {/* 7 Modules Navigation */}
        <nav className="px-3 space-y-1">
          {modules.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded-lg transition ${
                    isActive ? 'bg-white/10 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Left: Developer & Provider Branding (Wixfox Technologies) */}
      <div className="p-3 m-3 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800/90 shadow-lg">
        <a
          href="https://www.wixfox.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block group transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/90 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Technology Partner
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-400 transition" />
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Official Wixfox Logo from www.wixfox.com */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#1A6FD4] p-0.5 shadow-md shadow-orange-500/30 shrink-0 ring-1 ring-white/20 flex items-center justify-center">
              <img
                src="/wixfox-logo.svg"
                alt="Wixfox Technologies"
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.wixfox-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="wixfox-fallback hidden w-full h-full flex items-center justify-center text-lg">
                🦊
              </div>
            </div>

            <div className="overflow-hidden">
              <h3 className="text-xs font-black text-white group-hover:text-amber-300 transition tracking-tight truncate flex items-center gap-1">
                <span>Wix<span className="text-[#FF6B00]">Fox</span></span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Technologies</span>
              </h3>
              <p className="text-[10px] text-amber-400/90 font-mono font-medium truncate">
                www.wixfox.com
              </p>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Engineering & Design</span>
            <span className="text-emerald-400 font-semibold font-mono">v1.2.0</span>
          </div>
        </a>
      </div>
    </aside>
  );
}
