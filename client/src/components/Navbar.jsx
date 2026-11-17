import React from 'react';
import { Building2, CloudCheck, CloudOff, Users } from 'lucide-react';
import { isConfigured } from '../config/supabaseClient';

export default function Navbar({ onOpenSetup }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
              SHASHWAT GROUP
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              SaaS CRM • Billing • Inventory (Up to 5 Users)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Cloud Database Status Badge */}
          <button
            onClick={onOpenSetup}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
              isConfigured
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
          >
            {isConfigured ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase Live Connected</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Free Cloud Mode (Click to Connect Supabase)</span>
              </>
            )}
          </button>

          {/* Active User Pill */}
          <div className="flex items-center space-x-2 pl-3 border-l border-slate-200 text-sm">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
              SG
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="block font-semibold text-slate-800 text-xs">Admin Team</span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Users className="w-3 h-3 inline" /> 5 User License
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
