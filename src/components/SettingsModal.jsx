import React, { useState } from 'react';
import { 
  X, ShieldAlert, Cpu, Palette, Ghost, Zap, Video, Music, 
  Volume2, Power, Trash2, Link as LinkIcon, Upload, 
  ImageIcon, RotateCcw, Type, Users, UserPlus, Eye, Copy, Check,
  Sun, Moon
} from 'lucide-react';

export function SettingsModal({
  show, onClose, friendCode, displayName, setDisplayName,
  friends, onAddFriend, onViewFriend, onRemoveFriend,
  handlePfpUpload, handleResetPfp,
  performanceMode, setPerformanceMode,
  handleBackgroundUpload, handleAudioUpload, 
  handleResetBackground, handleResetMusic,
  bgEnabled, bgOpacity, setBgOpacity,
  bgMusic, volume, setVolume,
  panicKey, setPanicKey,
  themes, applyTheme,
  handleClearSettings, confirmClearSettings,
  handleReset, confirmReset,
  onViewOwnProfile,
  tracklist,
  isLightMode, setIsLightMode
}) {
  const [friendInput, setFriendInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!show) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFriend = () => {
    if (friendInput.trim()) {
      onAddFriend(friendInput.trim());
      setFriendInput(''); 
    }
  };

  const handlePanicKeyDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.key !== 'Escape' && e.key !== 'Tab') {
      setPanicKey(e.key);
    }
  };

  // UI Variable Logic
  const modalBg = isLightMode ? "bg-zinc-50/95 border-black/10 text-black" : "bg-zinc-900 border-white/10 text-white";
  const sectionBg = isLightMode ? "bg-black/5 border-black/5" : "bg-white/5 border-white/5";
  const inputBg = isLightMode ? "bg-black/5 border-black/10 text-black placeholder:text-zinc-500" : "bg-zinc-800 border-white/10 text-white";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`${modalBg} border p-6 rounded-3xl max-w-md w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar`}>
        
        {/* HEADER */}
        <div className={`flex items-center justify-between border-b ${isLightMode ? 'border-black/5 bg-zinc-50/50' : 'border-white/5 bg-zinc-900/50'} p-4 -mx-6 -mt-6 mb-4 rounded-t-3xl`}>
          <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--theme)]">
            <ShieldAlert className="w-5 h-5" /> System Settings
          </h2>
          <button 
            onClick={onClose} 
            className={`${isLightMode ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white'} transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--theme)] rounded-lg`}
            aria-label="Close settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* IDENTITY & SOCIAL */}
          <section className={`space-y-4 bg-[var(--theme)]/5 p-4 rounded-2xl border ${isLightMode ? 'border-[var(--theme)]/20' : 'border-[var(--theme)]/10'}`}>
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-black text-[var(--theme)] tracking-widest flex items-center gap-2">
                <Type className="w-3 h-3" /> Profile Identity
              </label>
              <button 
                onClick={onViewOwnProfile}
                className="flex items-center gap-1.5 px-3 py-1 bg-[var(--theme)] text-black rounded-full text-[9px] font-black uppercase hover:opacity-80 transition-all"
              >
                <Eye className="w-3 h-3" /> View My Profile
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <label className={`p-3 ${inputBg} border rounded-xl text-[9px] font-black uppercase text-center cursor-pointer hover:border-[var(--theme)]/50 transition-all`}>
                  <Upload className="w-3 h-3 mx-auto mb-1 text-[var(--theme)]" />
                  Upload IMG/GIF for PFP
                  <input type="file" accept="image/*" onChange={handlePfpUpload} className="hidden" />
                </label>
                <button 
                  onClick={handleResetPfp}
                  className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-[9px] font-black uppercase text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all flex flex-col items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Avatar
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Custom Display Name..." 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value.slice(0, 25))}
                className={`w-full ${inputBg} border rounded-xl p-3 text-xs outline-none focus:border-[var(--theme)]/50 font-bold`}
              />
              <div className={`${isLightMode ? 'bg-black/5 border-black/5' : 'bg-black/20 border-white/5'} p-3 rounded-xl border space-y-3`}>
                <div className="flex items-center justify-between">
                  <p className="text-[8px] font-black text-zinc-500 uppercase leading-none">Your Friend Code</p>
                  <button 
                    onClick={handleCopyCode}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${copied ? 'bg-green-500 text-black' : isLightMode ? 'bg-black/10 text-zinc-600 hover:bg-black/20' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className={`${isLightMode ? 'bg-white border-black/5' : 'bg-white/5 border-white/5'} p-2 rounded-lg border max-h-20 overflow-y-auto no-scrollbar`}>
                  <p className="text-[10px] font-mono font-black text-[var(--theme)] break-all leading-relaxed tracking-tight">
                    {friendCode}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FRIENDS LIST */}
          <section className={`space-y-4 ${sectionBg} p-4 rounded-2xl border`}>
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2">
              <Users className="w-3 h-3 text-[var(--theme)]" /> Friends List
            </label>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter friend code..." 
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value)}
                className={`flex-1 ${inputBg} border rounded-xl p-2.5 text-xs outline-none focus:border-[var(--theme)]/50`}
              />
              <button 
                onClick={handleAddFriend}
                className="p-2.5 bg-[var(--theme)] text-black rounded-xl hover:opacity-80 transition-all"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
              {friends?.length > 0 ? friends.map(friend => (
                <div key={friend.code} className={`flex items-center justify-between ${isLightMode ? 'bg-white border-black/5' : 'bg-white/5 border-white/5'} p-2 rounded-xl border`}>
                  <span title={friend.name} className="text-[10px] font-bold truncate max-w-[120px]">{friend.name}</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => onViewFriend(friend)}
                      className={`p-1.5 ${isLightMode ? 'bg-black/5 hover:bg-[var(--theme)]' : 'bg-white/5 hover:bg-[var(--theme)]'} hover:text-black rounded-lg transition-all`}
                    >
                      <span className="sr-only">View</span>
                      <Eye className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => onRemoveFriend(friend.code)}
                      className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                    >
                      <span className="sr-only">Delete</span>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-[9px] text-zinc-600 text-center py-2 italic font-medium uppercase tracking-tighter">No friends added yet</p>
              )}
            </div>
          </section>

          {/* PERFORMANCE MODE */}
          <section className="space-y-4 bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-black text-yellow-500 tracking-widest flex items-center gap-2">
                  <Cpu className="w-3 h-3" /> Performance Mode
                </label>
                <button 
                  onClick={() => setPerformanceMode(!performanceMode)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${performanceMode ? 'bg-yellow-500 text-black' : isLightMode ? 'bg-black/5 text-zinc-500 border border-black/10' : 'bg-white/5 text-zinc-500 border border-white/10'}`}
                >
                  <Zap className="w-3 h-3" />
                  {performanceMode ? 'ON' : 'OFF'}
                </button>
              </div>
              <p className="text-[8px] uppercase font-bold text-yellow-500/60 leading-tight tracking-tighter">
                {performanceMode 
                  ? "Music and heavy effects disabled to maximize CPU/RAM speed." 
                  : "Standard mode active. Music and visuals are enabled."}
              </p>
            </div>
          </section>

          {/* MEDIA UPLOADS */}
          <section className={`space-y-4 ${sectionBg} p-4 rounded-2xl border`}>
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2">
              <ImageIcon className="w-3 h-3 text-[var(--theme)]" /> Custom Media
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`p-3 ${inputBg} border rounded-xl text-[9px] font-black uppercase text-center cursor-pointer hover:border-[var(--theme)]/50 transition-all`}>
                <Upload className="w-3 h-3 mx-auto mb-1 text-[var(--theme)]" />
                Upload BG IMG/GIF
                <input type="file" accept="image/*,video/*" onChange={handleBackgroundUpload} className="hidden" />
              </label>
              <label className={`p-3 ${inputBg} border rounded-xl text-[9px] font-black uppercase text-center cursor-pointer hover:border-[var(--theme)]/50 transition-all`}>
                <Music className="w-3 h-3 mx-auto mb-1 text-[var(--theme)]" />
                Upload MP3
                <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
              </label>
              
              <button 
                onClick={handleResetBackground}
                className="p-2 bg-red-500/5 border border-red-500/10 rounded-xl text-[9px] font-black uppercase text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3 h-3" /> Reset BG
              </button>
              <button 
                onClick={handleResetMusic}
                className="p-2 bg-red-500/5 border border-red-500/10 rounded-xl text-[9px] font-black uppercase text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3 h-3" /> Reset Music
              </button>
            </div>

            {/* VOLUME SLIDER */}
            {bgMusic && (
              <div className={`pt-2 border-t ${isLightMode ? 'border-black/5' : 'border-white/5'} space-y-3`}>
                <div className="flex items-center justify-between">
                  <label className="text-[9px] uppercase font-black text-zinc-400 flex items-center gap-2">
                    <Volume2 className="w-3 h-3 text-[var(--theme)]" /> Music Volume
                  </label>
                  <span className="text-[10px] font-mono text-[var(--theme)]">{Math.round(volume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className={`w-full h-1.5 ${isLightMode ? 'bg-black/10' : 'bg-white/10'} rounded-lg appearance-none cursor-pointer accent-[var(--theme)]`}
                />
              </div>
            )}

            {/* BG OPACITY SLIDER */}
            {bgEnabled && !performanceMode && !bgMusic?.includes('/music/') && !bgMusic?.startsWith('data:') && (
              <div className={`pt-2 border-t ${isLightMode ? 'border-black/5' : 'border-white/5'} space-y-3`}>
                <div className="flex items-center justify-between">
                  <label className="text-[9px] uppercase font-black text-zinc-400 flex items-center gap-2">
                    <ImageIcon className="w-3 h-3 text-[var(--theme)]" /> BG Opacity
                  </label>
                  <span className="text-[10px] font-mono text-[var(--theme)]">{bgOpacity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={bgOpacity} 
                  onChange={(e) => setBgOpacity(Number(e.target.value))}
                  className={`w-full h-1.5 ${isLightMode ? 'bg-black/10' : 'bg-white/10'} rounded-lg appearance-none cursor-pointer accent-[var(--theme)]`}
                />
              </div>
            )}
          </section>

          {/* MUSIC LIBRARY PRESETS */}
          <section className={`space-y-4 bg-[var(--theme)]/5 p-4 rounded-2xl border ${isLightMode ? 'border-[var(--theme)]/20' : 'border-[var(--theme)]/10'}`}>
            <label className="text-[10px] uppercase font-black text-[var(--theme)] tracking-widest flex items-center gap-2">
              <Music className="w-3 h-3 text-[var(--theme)]" /> Music Library
            </label>
            <div className="grid grid-cols-1 gap-2">
              {tracklist?.map((song, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAudioUpload({ presetUrl: song.url });
                  }}
                  className={`p-3 ${isLightMode ? 'bg-white border-black/5 hover:bg-zinc-50' : 'bg-zinc-800/50 border-white/5'} border rounded-xl hover:border-[var(--theme)]/50 transition-all text-left flex items-center justify-between group relative z-10`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme)] group-hover:shadow-[0_0_8px_var(--theme)] transition-all flex-shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className={`text-[11px] font-bold ${isLightMode ? 'text-zinc-900' : 'text-zinc-200'} truncate`}>
                        {song.title}
                      </span>
                      <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-tight truncate">
                        {song.artist || "Unknown Artist"}
                      </span>
                    </div>
                  </div>
                  {song.isClean && (
                    <span className={`text-[8px] font-black ${isLightMode ? 'bg-zinc-200 text-zinc-600' : 'bg-zinc-700 text-zinc-400'} px-1.5 py-0.5 rounded uppercase flex-shrink-0`}>
                      Clean
                    </span>
                  )}
                </button>
              ))}
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
                value={panicKey} 
                onKeyDown={handlePanicKeyDown}
                className={`flex-1 ${inputBg} border rounded-xl p-3 text-xs outline-none focus:border-red-500/50 text-center font-mono font-bold`} 
                readOnly 
              />
              {panicKey && (
                <button onClick={() => setPanicKey('')} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              )}
            </div>
          </section>

          {/* THEMES */}
          <section className="space-y-3">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2">
              <Palette className="w-3 h-3" /> Themes
            </label>
            
            {/* LIGHT MODE TOGGLE */}
            <button 
              onClick={() => setIsLightMode(!isLightMode)}
              className={`w-full p-3 mb-2 ${isLightMode ? 'bg-black/5 border-black/10 text-black hover:bg-black/10' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'} border rounded-xl text-[10px] font-black uppercase hover:border-[var(--theme)] flex items-center justify-center gap-2 transition-all`}
            >
              {isLightMode ? <Sun className="w-3.5 h-3.5 text-yellow-500" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />} 
              {isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(themes || {}).map(([id, t]) => (
                <button 
                  key={id} 
                  onClick={() => applyTheme(t)} 
                  className={`p-3 ${isLightMode ? 'bg-black/5 border-black/10 hover:bg-black/10' : 'bg-white/5 border-white/10 hover:bg-white/10'} border rounded-xl text-[10px] font-bold hover:border-[var(--theme)] flex items-center gap-2 transition-all`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} /> {t.name}
                </button>
              ))}
            </div>
          </section>

          {/* RESET BUTTONS */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button 
              onClick={handleClearSettings} 
              className={`p-4 rounded-2xl border transition-all text-[9px] font-black uppercase flex items-center justify-center gap-2 ${
                confirmClearSettings 
                  ? 'bg-orange-500 text-black border-orange-400 animate-pulse' 
                  : 'border-orange-500/20 bg-orange-500/5 text-orange-500 hover:bg-orange-500/10'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${confirmClearSettings ? 'animate-spin' : ''}`} /> 
              {confirmClearSettings ? 'ARE YOU SURE?' : 'Clear Settings'}
            </button>

            <button 
              onClick={handleReset} 
              className={`p-4 rounded-2xl border transition-all text-[9px] font-black uppercase flex items-center justify-center gap-2 ${
                confirmReset 
                  ? 'bg-red-500 text-black border-red-400 animate-pulse' 
                  : 'border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10'
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${confirmReset ? 'animate-spin' : ''}`} />
              {confirmReset ? 'ARE YOU SURE?' : 'Factory Reset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
