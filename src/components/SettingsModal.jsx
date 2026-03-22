import React from 'react';
import { 
  X, ShieldAlert, Cpu, Palette, Ghost, Zap, Video, Music, 
  Volume2, Power, Trash2, Link as LinkIcon, Upload, 
  ImageIcon, RotateCcw, Type
} from 'lucide-react';

export function SettingsModal(props) {
  if (!props.show) return null;

  const DISGUISE_OPTIONS = ['None', 'Google', 'Drive', 'Classroom', 'Docs', 'Canvas'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--theme)]">
            <ShieldAlert className="w-5 h-5" /> System Config
          </h2>
          <X onClick={props.onClose} className="cursor-pointer text-zinc-400 hover:text-white transition-colors" />
        </div>

        <div className="space-y-6">
          {/* PERFORMANCE MODE */}
          <section className="space-y-4 bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/10">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-black text-yellow-500 tracking-widest flex items-center gap-2">
                <Cpu className="w-3 h-3" /> Performance Mode
              </label>
              <button 
                onClick={() => props.setPerformanceMode(!props.performanceMode)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${props.performanceMode ? 'bg-yellow-500 text-black' : 'bg-white/5 text-zinc-500 border border-white/10'}`}
              >
                <Zap className="w-3 h-3" />
                {props.performanceMode ? 'ON' : 'OFF'}
              </button>
            </div>
          </section>

          {/* MEDIA UPLOADS (BG & MUSIC) */}
          <section className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2">
              <ImageIcon className="w-3 h-3 text-[var(--theme)]" /> Custom Media
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="p-3 bg-zinc-800 border border-white/10 rounded-xl text-[9px] font-black uppercase text-center cursor-pointer hover:border-[var(--theme)]/50 transition-all">
                <Upload className="w-3 h-3 mx-auto mb-1 text-[var(--theme)]" />
                Upload BG
                <input type="file" accept="image/*,video/*" onChange={props.handleBackgroundUpload} className="hidden" />
              </label>
              <label className="p-3 bg-zinc-800 border border-white/10 rounded-xl text-[9px] font-black uppercase text-center cursor-pointer hover:border-[var(--theme)]/50 transition-all">
                <Music className="w-3 h-3 mx-auto mb-1 text-[var(--theme)]" />
                Upload MP3
                <input type="file" accept="audio/*" onChange={props.handleAudioUpload} className="hidden" />
              </label>
            </div>
          </section>

          {/* PANIC PROTOCOL */}
          <section className="space-y-4 bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
            <label className="text-[10px] uppercase font-black text-red-500 tracking-widest flex items-center gap-2">
              <Ghost className="w-3 h-3" /> Panic Key
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Press key..." 
                value={props.panicKey} 
                onKeyDown={(e) => { e.preventDefault(); props.setPanicKey(e.key); }}
                className="flex-1 bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-red-500/50 text-center font-mono font-bold" 
                readOnly 
              />
              {props.panicKey && (
                <button onClick={() => props.setPanicKey('')} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              )}
            </div>
          </section>

          {/* THEMES */}
          <section className="space-y-3">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2">
              <Palette className="w-3 h-3" /> Capy-Themes
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(props.themes).map(([id, t]) => (
                <button key={id} onClick={() => props.applyTheme(t)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold hover:border-[var(--theme)] flex items-center gap-2 transition-all">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} /> {t.name}
                </button>
              ))}
            </div>
          </section>

          {/* RESET BUTTONS */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button onClick={props.handleClearSettings} className="p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 text-orange-500 text-[9px] font-black uppercase flex items-center justify-center gap-2">
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>
            <button onClick={props.handleReset} className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 text-[9px] font-black uppercase flex items-center justify-center gap-2">
              <Trash2 className="w-3.5 h-3.5" /> Wipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
