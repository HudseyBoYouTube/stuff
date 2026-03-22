import React from 'react';
import { X, ShieldAlert, Cpu, Palette, Ghost, Zap, Video, Music, Volume2, Power, Trash2, Link as LinkIcon, Type, ImageIcon } from 'lucide-react';

export function SettingsModal({ 
  show, 
  onClose, 
  performanceMode, 
  setPerformanceMode,
  panicUrl,
  setPanicUrl,
  panicKey,
  setPanicKey,
  disguise,
  setDisguise,
  themes,
  applyTheme
}) {
  if (!show) return null;

  const DISGUISE_OPTIONS = ['None', 'Google', 'Drive', 'Classroom', 'Docs', 'Canvas'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--theme)]">
            <ShieldAlert className="w-5 h-5" /> System Config
          </h2>
          <X onClick={onClose} className="cursor-pointer text-zinc-400 hover:text-white transition-colors" />
        </div>

        <div className="space-y-6">
          {/* PERFORMANCE MODE */}
          <section className="space-y-4 bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/10">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-black text-yellow-500 tracking-widest flex items-center gap-2">
                <Cpu className="w-3 h-3" /> Performance Mode
              </label>
              <button 
                onClick={() => setPerformanceMode(!performanceMode)}
                className={`w-10 h-5 rounded-full transition-all relative ${performanceMode ? 'bg-yellow-500' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${performanceMode ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </section>

          {/* PANIC SETTINGS */}
          <section className="space-y-4">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2">
              <Power className="w-3 h-3" /> Panic Protocol
            </label>
            <div className="grid gap-2">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                <input 
                  type="text" 
                  value={panicUrl} 
                  onChange={(e) => setPanicUrl(e.target.value)}
                  placeholder="Redirect URL..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-4 text-xs outline-none focus:border-[var(--theme)]/50"
                />
              </div>
              <div className="relative">
                <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                <input 
                  type="text" 
                  value={panicKey} 
                  onChange={(e) => setPanicKey(e.target.value)}
                  placeholder="Panic Key (e.g. Escape)..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-4 text-xs outline-none focus:border-[var(--theme)]/50"
                />
              </div>
            </div>
          </section>

          {/* THEMES */}
          <section className="space-y-3">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2">
              <Palette className="w-3 h-3" /> Visual Identity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(themes).map(([id, t]) => (
                <button 
                  key={id} 
                  onClick={() => applyTheme(t)}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold hover:border-[var(--theme)] transition-all flex flex-col items-center gap-1"
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.name}
                </button>
              ))}
            </div>
          </section>

          {/* STEALTH MODE */}
          <section className="space-y-3">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2">
              <Ghost className="w-3 h-3" /> Tab Disguise
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DISGUISE_OPTIONS.map(opt => (
                <button 
                  key={opt} 
                  onClick={() => setDisguise(opt)}
                  className={`p-2 rounded-xl text-[10px] font-bold border transition-all ${disguise === opt ? 'border-[var(--theme)] bg-[var(--theme)]/10 text-[var(--theme)]' : 'border-white/5 bg-white/5 text-zinc-500'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
