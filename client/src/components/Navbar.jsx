import React from 'react';
import { 
  Building2, 
  Users, 
  LogOut, 
  RefreshCw, 
  Shield, 
  RotateCcw,
  Search,
  Sun,
  Moon,
  Send,
  Bell,
  Sparkles
} from 'lucide-react';
import { isConfigured } from '../config/supabaseClient';
import { SHASHWAT_WOODS_LOGO, SHASHWAT_ASHAPURA_WOODS_LOGO } from '../constants/firmLogos';

export default function Navbar({ 
  firm, 
  user, 
  onSwitchFirm, 
  onToggleDivision,
  onLogout, 
  onFactoryReset,
  isGlowHigh = true,
  onToggleGlow,
  onOpenWhatsAppReport
}) {
  const isAshapura = firm?.id === 'shashwat_ashapura_woods' || firm?.name?.toLowerCase().includes('ashapura');

  const getInitials = (name) => {
    if (!name) return 'SG';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleResetClick = () => {
    if (confirm("FACTORY RESET WARNING:\n\nAre you sure you want to permanently clear all space and delete all data (inventory, invoices, vehicles, documents, and history)?\n\nThis will give you completely fresh, clean software to enter new records.")) {
      if (onFactoryReset) {
        onFactoryReset();
      }
    }
  };

  return (
    <header className="bg-slate-950/65 backdrop-blur-2xl border-b border-white/15 sticky top-0 z-30 px-4 sm:px-6 py-2.5 shadow-2xl text-white transition-all duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Top Left: Active Firm Division Identity & Quick Division Switcher */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            <img
              src={firm?.logo || (isAshapura ? SHASHWAT_ASHAPURA_WOODS_LOGO : SHASHWAT_WOODS_LOGO)}
              alt={firm?.name || 'Firm Logo'}
              onError={(e) => {
                e.currentTarget.src = isAshapura ? SHASHWAT_ASHAPURA_WOODS_LOGO : SHASHWAT_WOODS_LOGO;
              }}
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight leading-none uppercase drop-shadow-sm">
                {firm?.shortName || (isAshapura ? 'ASHAPURA' : 'SHASHWAT')}
              </h1>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/20 ${
                isAshapura ? 'bg-amber-500/25 text-amber-300' : 'bg-emerald-500/25 text-emerald-300'
              }`}>
                {isAshapura ? 'Plywood Division' : 'Timber Division'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={onToggleDivision}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-bold text-amber-300 hover:text-white transition shadow-sm cursor-pointer"
                title={`Switch to ${isAshapura ? 'Shashwat Woods (Timber)' : 'Shashwat Ashapura Woods (Plywood)'}`}
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Switch to {isAshapura ? 'Timber' : 'Plywood'}</span>
              </button>

              <button
                type="button"
                onClick={onSwitchFirm}
                className="text-[10px] font-medium text-slate-400 hover:text-slate-200 underline transition cursor-pointer"
                title="All divisions portal"
              >
                All Divisions
              </button>
            </div>
          </div>
        </div>

        {/* Center: Glowing Chromatic AI Search / Prompt Pill (21st.dev Command Center Style) */}
        <div className="w-full md:w-auto flex-1 max-w-md mx-auto">
          <div className="relative flex items-center rounded-full bg-black/40 hover:bg-black/55 border border-white/20 px-3.5 py-1.5 backdrop-blur-md shadow-inner transition group focus-within:ring-2 focus-within:ring-amber-400/50">
            {/* Chromatic Iridescent Orb */}
            <div className="relative flex items-center justify-center mr-2.5 shrink-0">
              <span className="absolute w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 via-pink-400 to-amber-300 blur-[3px] opacity-80 animate-pulse" />
              <span className="relative w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 via-rose-400 to-amber-200 shadow-sm" />
            </div>

            <input
              type="text"
              placeholder="Show me what needs attention in billing, stock & dispatches..."
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none font-medium truncate"
            />

            <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0 group-hover:text-white transition" />
          </div>
        </div>

        {/* Top Right: Ambient Lighting, WhatsApp Summary & User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 self-end md:self-auto">
          {/* Ambient Lighting Toggle */}
          {onToggleGlow && (
            <button
              type="button"
              onClick={onToggleGlow}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-amber-300 transition cursor-pointer"
              title="Toggle Ambient Glass Lighting"
            >
              {isGlowHigh ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
          )}

          {/* WhatsApp Executive Summary Report */}
          {onOpenWhatsAppReport && (
            <button
              type="button"
              onClick={onOpenWhatsAppReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-500/90 text-white border border-emerald-400/30 text-xs font-bold transition shadow-md cursor-pointer backdrop-blur-md"
              title="Send Executive PDF Report to WhatsApp"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          )}

          {/* Active Logged-in User Profile */}
          <div className="flex items-center space-x-2 pl-2 border-l border-white/15">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-black text-xs shadow-md shrink-0 ring-1 ring-white/30">
              {getInitials(user?.name || user?.firstName || 'SG')}
            </div>

            <div className="hidden lg:block text-left leading-tight">
              <span className="block font-bold text-white text-xs tracking-tight truncate max-w-[120px]">
                {user?.name || `${user?.firstName || 'Authorized'} ${user?.lastName || 'User'}`}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-emerald-400" />
                {user?.role || 'Administrator'}
              </span>
            </div>

            {/* Factory Reset Button */}
            <button
              onClick={handleResetClick}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/10 transition"
              title="Factory Reset (Clear All Data)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
