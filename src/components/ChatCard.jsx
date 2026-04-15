import React, { useState } from 'react';
import { Send, UserPlus } from 'lucide-react';

export function ChatCard({ isLightMode }) {
  const [username, setUsername] = useState(localStorage.getItem('capy-username') || '');
  const [isJoined, setIsJoined] = useState(!!username);

  const handleJoin = (e) => {
    e.preventDefault();
    const val = e.target.username.value.trim();
    if (val) {
      localStorage.setItem('capy-username', val);
      setUsername(val);
      setIsJoined(true);
    }
  };

  return (
    <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
      isLightMode 
        ? 'bg-white border-black/5 shadow-sm' 
        : 'bg-[#0f0f11] border-white/5 hover:border-[var(--theme)]/50'
    } p-5 h-full flex flex-col gap-4`}>
      
      {/* CARD HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--theme)]">
          Live Comms Terminal
        </h3>
        <div className={`w-2 h-2 rounded-full animate-pulse bg-[var(--theme)] shadow-[0_0_8px_var(--theme)]`} />
      </div>

      {!isJoined ? (
        <form onSubmit={handleJoin} className="flex flex-col gap-3 my-auto">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-zinc-500">IDENTIFICATION REQUIRED</p>
            <input 
              name="username"
              type="text"
              placeholder="Enter Custom Handle..."
              className={`w-full text-xs p-3 rounded-xl border outline-none transition-all ${
                isLightMode 
                  ? 'bg-black/5 border-black/10 focus:border-black/20' 
                  : 'bg-white/5 border-white/10 focus:border-[var(--theme)]'
              }`}
            />
          </div>
          <button className="w-full py-3 bg-[var(--theme)] text-black font-bold text-[10px] rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
            <UserPlus className="w-3.5 h-3.5" /> AUTHORIZE ACCESS
          </button>
        </form>
      ) : (
        <div className="flex flex-col h-full gap-3">
          <div className={`flex-1 overflow-y-auto rounded-xl p-3 text-[10px] font-mono ${isLightMode ? 'bg-black/5' : 'bg-black/40'}`}>
            <div className="mb-2 text-zinc-500 uppercase italic">[ SYSTEM: Welcome, {username} ]</div>
            {/* Messages would map here */}
            <div className="text-zinc-400">
              <span className="text-[var(--theme)] font-bold">HudseyBo:</span> Anyone want to speedrun Roblox Rivals?
            </div>
          </div>
          
          <div className="relative">
            <input 
              placeholder="Transmit message..."
              className={`w-full text-[10px] p-2 pr-8 rounded-lg border outline-none ${
                isLightMode ? 'bg-black/5' : 'bg-white/5 border-white/10 focus:border-[var(--theme)]'
              }`}
            />
            <Send className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--theme)] cursor-pointer" />
          </div>
        </div>
      )}
    </div>
  );
}
