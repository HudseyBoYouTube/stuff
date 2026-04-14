import { Search, Dices, Calendar, Clock, Battery, UserCircle, Settings, X } from 'lucide-react';

export function Header({ 
  searchQuery, setSearchQuery, 
  time, battery, 
  profilePic, setShowSettings, 
  onRandomGame, DEFAULT_ICON,
  onViewProfile,
  isLightMode,
  /* ADDED PROPS */
  supplier, setSupplier
}) {
  return (
    <header className={`${isLightMode ? 'bg-white text-black' : 'bg-[#09090b]/95 text-white'} h-16 flex items-center px-4 backdrop-blur-md sticky top-0 z-50 transition-colors`}>
      <div className="max-w-7xl mx-auto w-full grid grid-cols-[1fr_2fr_1fr] items-center">
        
        {/* LOGO SECTION */}
        <div className="flex items-center gap-2">
          <img src={DEFAULT_ICON} alt="Logo" className="w-7 h-7 object-contain" />
          <span className="text-xl font-black hidden lg:block tracking-tighter">
            Capybara <span className="text-[var(--theme)]">Science</span>
          </span>
        </div>

        {/* SEARCH & RANDOM SECTION - CENTERED GROUP */}
        <div className="flex items-center justify-center gap-3 w-full">
          <div className="relative w-full max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input 
              type="text" 
              placeholder="Search games..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className={`w-full ${isLightMode ? 'bg-black/5 border-black/10 text-black' : 'bg-white/5 border-white/10 text-white'} border rounded-full py-2 pl-10 pr-10 text-xs outline-none focus:border-[var(--theme)]/50 transition-colors`} 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-full text-[var(--theme)]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button onClick={onRandomGame} className={`p-2 ${isLightMode ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'} border rounded-full text-[var(--theme)] hover:bg-[var(--theme)] hover:text-black transition-all shadow-[0_0_15px_rgba(var(--theme-rgb),0.1)]`}>
            <Dices className="w-5 h-5" />
          </button>

          <div className="relative flex items-center">
            <select 
              value={supplier} 
              onChange={(e) => {
                setSupplier(e.target.value);
                localStorage.setItem('capy-supplier', e.target.value);
              }}
              className={`text-[10px] font-bold uppercase py-2 pl-3 pr-8 rounded-lg border transition-all outline-none cursor-pointer appearance-none ${
                isLightMode 
                  ? 'bg-black/5 border-black/10 text-black' 
                  : 'bg-white/5 border-white/10 text-white'
              } focus:border-[var(--theme)]`}
            >
              <option value="Default" className="bg-[#09090b] text-white">Capybara Science</option>
              <option value="GN Math" className="bg-[#09090b] text-white">gn-math</option>
              <option value="Truffled" className="bg-[#09090b] text-white">Truffled</option>
            </select>
            <div className="absolute right-2 pointer-events-none flex items-center justify-center">
              <span style={{ fontSize: '8px', color: 'var(--theme)', opacity: 0.8 }}>▼</span>
            </div>
          </div>
        </div>

        {/* STATS & PROFILE SECTION */}
        <div className="flex items-center justify-end gap-4">
          <div className={`hidden sm:flex items-center gap-3 text-[9px] font-black uppercase text-[var(--theme)] ${isLightMode ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/5'} px-3 py-1.5 rounded-full border`}>
            <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            <div className={`flex items-center gap-1 border-l ${isLightMode ? 'border-black/10' : 'border-white/10'} pl-3`}>
              <Battery className={`w-3 h-3 ${battery.charging ? 'text-green-500 animate-pulse' : ''}`} />
              <span>{battery.level}%</span>
            </div>
          </div>
          
          <div className={`flex items-center gap-1 ${isLightMode ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/5'} rounded-full p-1 border`}>
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

              <button 
                onClick={() => setShowSettings(true)} 
                className="p-1.5 transition-all hover:scale-110 active:rotate-90 group flex items-center justify-center"
              >
                <Settings 
                  className="w-5 h-5" 
                  style={{ 
                    color: 'var(--theme)',
                    filter: 'drop-shadow(0 0 8px var(--theme))'
                  }}
                />
              </button>
          </div>
        </div>
      </div>
    </header>
  );
}
