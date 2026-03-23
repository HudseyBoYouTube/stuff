import React, { useState } from 'react';
// 1. Import your tracklist data
import { myLibrary } from '../data/tracklist'; 
import { 
  X, ShieldAlert, Cpu, Palette, Ghost, Zap, Video, Music, 
  Volume2, Power, Trash2, Link as LinkIcon, Upload, 
  ImageIcon, RotateCcw, Type, Users, UserPlus, Eye, Copy, Check,
  GraduationCap // New icon for school mode
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
  // Add a way to update the parent's music state
  setBgMusic 
}) {
  const [friendInput, setFriendInput] = useState('');
  const [copied, setCopied] = useState(false);
  // 2. Add local state for School Mode
  const [schoolMode, setSchoolMode] = useState(false);

  if (!show) return null;

  // 3. Filter the library based on school mode
  const visibleSongs = schoolMode 
    ? myLibrary.filter(song => song.isClean) 
    : myLibrary;

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--theme)]">
            <ShieldAlert className="w-5 h-5" /> System Settings
          </h2>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--theme)] rounded-lg"
            aria-label="Close settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* SCHOOL MODE TOGGLE */}
          <section className="space-y-4 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-black text-blue-400 tracking-widest flex items-center gap-2">
                <GraduationCap className="w-3 h-3" /> School Mode
              </label>
              <button 
                onClick={() => setSchoolMode(!schoolMode)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${schoolMode ? 'bg-blue-500 text-black' : 'bg-white/5 text-zinc-500 border border-white/10'}`}
              >
                {schoolMode ? 'ENABLED (CLEAN)' : 'DISABLED'}
              </button>
            </div>
          </section>

          {/* IDENTITY & SOCIAL (Kept original code here...) */}
          {/* ... (Your existing Profile Identity section) ... */}

          {/* MEDIA UPLOADS & PRESETS */}
          <section className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2">
              <Music className="w-3 h-3 text-[var(--theme)]" /> Audio Settings
            </label>
            
            {/* Upload Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <label className="p-3 bg-zinc-800 border border-white/10 rounded-xl text-[9px] font-black uppercase text-center cursor-pointer hover:border-[var(--theme)]/50 transition-all">
                <Music className="w-3 h-3 mx-auto mb-1 text-[var(--theme)]" />
                Upload MP3/MP4
                <input type="file" accept="audio/*,video/*" onChange={handleAudioUpload} className="hidden" />
              </label>
              <button 
                onClick={handleResetMusic}
                className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-[9px] font-black uppercase text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all flex flex-col items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Music
              </button>
            </div>

            {/* PRESET LIST */}
            <div className="space-y-2 pt-2">
              <p className="text-[8px] font-black text-zinc-500 uppercase">Preset Library</p>
              <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                {visibleSongs.map((song, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      // We pass the URL to the main audio state
                      handleAudioUpload({ target: { files: [] }, presetUrl: song.url });
                    }}
                    className="flex items-center justify-between bg-white/5 hover:bg-[var(--theme)]/10 p-2 rounded-lg border border-white/5 text-left group transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold group-hover:text-[var(--theme)]">{song.title}</span>
                      <span className="text-[8px] text-zinc-500 uppercase">{song.artist}</span>
                    </div>
                    <Music className="w-3 h-3 text-zinc-600 group-hover:text-[var(--theme)]" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* REST OF YOUR CODE (Themes, Reset, etc.) */}
          {/* ... (Keep your Panic Key, Themes, and Reset buttons here) ... */}

        </div>
      </div>
    </div>
  );
}
