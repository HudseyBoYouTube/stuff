import { Search, Dices, Calendar, Clock, Battery, UserCircle, Settings, X } from 'lucide-react';

export function Header({ 
  searchQuery, setSearchQuery, 
  time, battery, 
  profilePic, setShowSettings, 
  onRandomGame, DEFAULT_ICON,
  onViewProfile // Added this prop to trigger the FriendViewModal for yourself
}) {
  return (
    <header className="border-b border-white/5 h-16 flex items-center px-4 bg-[#09090b]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
        
        {/* LOGO SECTION */}
        <div className="flex items-center gap-2">
          <img src={DEFAULT_ICON} alt="Logo" className="w-7 h-7 object-contain" />
          <span className="text-xl font-black hidden lg:block tracking-tighter">
            Capybara <span className="text-[var(--theme)]">Science</span>
          </span>
        </div>

        {/* SEARCH & RANDOM SECTION */}
        <div className="flex items-center gap-2 w-full justify-self-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input 
              type="text" 
              placeholder="Search games..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-10 text-xs outline-none focus:border-[var(--theme)]/50 transition-colors" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-full text-[var(--theme)]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button onClick={onRandomGame} className="p-2 bg-white/5 border border-white/10 rounded-full text-[var(--theme)] hover:bg-[var(--theme)] hover:text-black transition-all shadow-[0_0_15px_rgba(var(--theme-rgb),0.1)]">
            <Dices className="w-5 h-5" />
          </button>
        </div>

        {/* STATS & PROFILE SECTION */}
        <div className="flex items-center justify-end gap-4">
          <div className="hidden sm:flex items-center gap-3 text-[9px] font-black uppercase text-[var(--theme)] bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            <div className="flex items-center gap-1 border-l border-white/10 pl-3">
              <Battery className={`w-3 h-3 ${battery.charging ? 'text-green-500 animate-pulse' : ''}`} />
              <span>{battery.level}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
             {/* Profile Picture Button - Opens the Modal we just fixed */}
             <button 
               onClick={() => onViewProfile?.()} 
               className="w-8 h-8 rounded-full border border-transparent hover:border-[var(--theme)] overflow-hidden bg-zinc-800 transition-all active:scale-90"
             >
               {profilePic ? (
                 <img src={profilePic} className="w-full h-full object-cover" alt="Profile" />
               ) : (
                 <UserCircle className="w-full h-full p-1 text-[var(--theme)]" />
               )}
             </button>

             {/* Settings Gear Button */}
             <button 
               onClick={() => setShowSettings(true)} 
               className="p-1.5 text-zinc-500 hover:text-[var(--theme)] transition-colors"
             >
               <Settings className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
    </header>
  );
}
