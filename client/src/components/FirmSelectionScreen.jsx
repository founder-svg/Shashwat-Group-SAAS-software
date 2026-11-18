import React from 'react';
import { Building2, ArrowRight, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { FIRMS } from '../constants/firms';

export default function FirmSelectionScreen({ onSelectFirm }) {
  const firmList = Object.values(FIRMS);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full pt-4 sm:pt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Shashwat Group Enterprise Gateway</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          SHASHWAT GROUP
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mt-2 font-medium">
          Commercial Management System for Billing, Inventory, and Transport Logistics. Select your business division to begin.
        </p>
      </header>

      {/* Main Firm Cards */}
      <main className="max-w-5xl mx-auto w-full my-8">
        <div className="text-center mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Step 1: Choose Your Business Division
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {firmList.map((firm) => (
            <div
              key={firm.id}
              onClick={() => onSelectFirm(firm)}
              className="group relative rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/80 p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle Ambient Glow */}
              <div className="absolute -right-20 -top-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-500"></div>

              <div>
                {/* Firm Logo Container */}
                <div className="w-full h-44 sm:h-52 rounded-2xl bg-white/5 border border-slate-800/80 p-3 flex items-center justify-center overflow-hidden mb-6 group-hover:border-slate-700 transition">
                  <img
                    src={firm.logo}
                    alt={firm.name}
                    className="max-h-full max-w-full object-contain rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Firm Titles & Details */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${firm.badgeColor}`}>
                    {firm.shortName} DIVISION
                  </span>
                  {firm.motto && (
                    <span className="text-xs text-amber-400 font-serif font-bold italic">
                      {firm.motto}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition tracking-tight">
                  {firm.name}
                </h2>

                <p className="text-slate-300 text-xs sm:text-sm font-semibold mt-1">
                  {firm.tagline}
                </p>

                <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                  {firm.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Authorized Team Portal
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md group-hover:from-amber-400 group-hover:to-orange-400 transition"
                >
                  <span>Enter Division</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Footer: WixFox Branding */}
      <footer className="max-w-6xl mx-auto w-full pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          © 2026 <strong>Shashwat Group</strong>. Multi-Division Commercial ERP.
        </div>

        <a
          href="https://www.wixfox.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition group"
        >
          <img
            src="/wixfox-logo.svg"
            alt="Wixfox"
            className="w-5 h-5 rounded-md object-contain"
          />
          <span className="text-slate-300 group-hover:text-white font-medium">
            Engineered by <strong className="text-amber-400">Wixfox Technologies</strong>
          </span>
          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-400" />
        </a>
      </footer>
    </div>
  );
}
