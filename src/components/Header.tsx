import React from 'react';
import { Sparkles, Radio, FileText, Mail, ShieldCheck, Zap } from 'lucide-react';
import { GREN_PROFILE } from '../data/grenResumeData';

interface HeaderProps {
  activeTab: 'chat' | 'voice' | 'document';
  setActiveTab: (tab: 'chat' | 'voice' | 'document') => void;
  isVoiceLive: boolean;
  onOpenContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isVoiceLive,
  onOpenContact,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Profile Info */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 p-0.5 shadow-lg shadow-amber-500/10">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-amber-400 font-bold text-lg">
                G
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full ring-2 ring-emerald-500/30 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                Joel
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-md">
                Gren&apos;s AI Representative
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verified CV &amp; Audit
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Representing <strong className="text-slate-200">Gren (@Gren)</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300/90 font-medium">Quick-thinking · Dependable · Driven</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs and Quick Actions */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 relative ${
                activeTab === 'voice'
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isVoiceLive ? 'text-emerald-400 animate-pulse' : 'text-indigo-400'}`} />
              <span>Live Voice</span>
              <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                3.8 Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('document')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'document'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Perception Audit</span>
              <span className="sm:hidden">Audit</span>
            </button>
          </div>

          <button
            onClick={onOpenContact}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-medium transition-all shadow-sm hover:border-slate-600"
            title={`Email Gren at ${GREN_PROFILE.email}`}
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Contact Gren</span>
          </button>
        </div>
      </div>
    </header>
  );
};
