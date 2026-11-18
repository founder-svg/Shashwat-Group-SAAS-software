import React from 'react';
import { Building2, Users, LogOut, RefreshCw, Shield, RotateCcw } from 'lucide-react';
import { isConfigured } from '../config/supabaseClient';

export default function Navbar({ firm, user, onSwitchFirm, onLogout, onFactoryReset }) {
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between">
        {/* Top Left: Active Firm Branding */}
        <div className="flex items-center space-x-3">
          {firm?.logo ? (
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              <img
                src={firm.logo}
                alt={firm.name}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none uppercase">
                {firm?.name || 'SHASHWAT GROUP'}
              </h1>
              {firm?.shortName && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${firm.badgeColor || 'bg-slate-800 text-white'}`}>
                  {firm.shortName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                {firm?.motto || firm?.tagline || 'Commercial SaaS ERP • Up to 5 Users'}
              </p>
              <button
                type="button"
                onClick={onSwitchFirm}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 hover:text-brand-800 hover:underline transition"
                title="Switch business division"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Switch
              </button>
            </div>
          </div>
        </div>

        {/* Top Right: Status & User Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Cloud Sync Status Badge (Neutral & Professional) */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cloud Synced</span>
          </div>

          {/* Active Logged-in User Profile */}
          <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 ring-2 ring-white">
              {getInitials(user?.name || user?.firstName || 'SG')}
            </div>

            <div className="text-left leading-tight">
              <span className="block font-bold text-slate-900 text-xs sm:text-sm tracking-tight truncate max-w-[130px] sm:max-w-[180px]">
                {user?.name || `${user?.firstName || 'Authorized'} ${user?.lastName || 'User'}`}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-emerald-600" />
                {user?.role || 'Administrator'}
              </span>
            </div>

            {/* Factory Reset Button */}
            <button
              onClick={handleResetClick}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition ml-1"
              title="Factory Reset (Clear All Data)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
