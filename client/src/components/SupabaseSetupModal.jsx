import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Users 
} from 'lucide-react';
import { isConfigured } from '../config/supabaseClient';

export default function SupabaseSetupModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleEnv = `VITE_SUPABASE_URL=https://your-project-ref.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOi...`;

  const copyEnv = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
        <div className="bg-brand-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Connect 100% Free Supabase Cloud Database</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-700">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Option A: Zero Server Maintenance Architecture Active!
            </p>
            <p className="text-[11px] text-emerald-700">
              Supabase provides 500 MB PostgreSQL cloud storage, built-in Auth for all 5 team members, and instant real-time synchronization with ₹0 monthly hosting bills.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Quick 3-Minute Setup:</h3>

            <div className="space-y-2.5">
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Create a free project at{' '}
                  <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-brand-600 font-bold hover:underline inline-flex items-center gap-0.5">
                    supabase.com <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  (Choose <strong>Mumbai / ap-south-1</strong> region for fastest latency in India).
                </p>
              </div>

              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  In the Supabase Dashboard, go to <strong>SQL Editor</strong>, paste the contents of{' '}
                  <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-900">
                    database/schema.sql
                  </code>, and click <strong>Run</strong>.
                </p>
              </div>

              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  Go to <strong>Project Settings</strong> → <strong>API</strong>, copy your <strong>Project URL</strong> and <strong>anon public key</strong>, and paste them into your{' '}
                  <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-900">client/.env</code>:
                </p>
              </div>
            </div>
          </div>

          {/* Sample Env Box */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl relative font-mono text-[11px]">
            <button
              onClick={copyEnv}
              className="absolute right-3 top-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center space-x-1 text-[10px] transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <p className="text-slate-400 mb-1"># client/.env</p>
            <p>{sampleEnv}</p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="text-slate-500 font-medium text-[11px] flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Supports up to 5 concurrent team logins
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
            >
              Got it, close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
