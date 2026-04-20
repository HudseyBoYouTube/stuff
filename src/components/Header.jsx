import { Search, Dices, Calendar, Clock, Battery, UserCircle, Settings, X, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header({ 
  searchQuery, setSearchQuery, 
  time, battery, 
  profilePic, setShowSettings, 
  onRandomGame, DEFAULT_ICON,
  onViewProfile,
  isLightMode,
  supplier, setSupplier,
  isChatOpen, setIsChatOpen
}) {
  const navigate = useNavigate();

  return (
    <header className={`${isLightMode ? 'bg-white text-black' : 'bg-[#09090b]/95 text-white'} h-16 flex items-center px-4 backdrop-blur-md sticky top-0 z-50 transition-colors`}>
      <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
        
        {/* LEFT COLUMN: LOGO */}
        <div className="flex items-center gap-2 justify-self-start">
          <img src={DEFAULT_ICON} alt="Logo" className="w-7 h-7 object-contain" />
          <span 
            className="text-xl font-semibold hidden lg:block tracking-tighter"
            style={{ 
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 600 
            }}
          >
            Capybara <span className="text-[var(--theme)]">Science</span>
          </span>
        </div>

        {/* CENTER COLUMN: SEARCH & BUTTON GROUP */}
        {/* We use a flex container here to keep the search bar the priority for centering */}
        <div className="flex items-center justify-center gap-2 w-full justify-self-center">
          
          {/* Centered Search Bar */}
          <div className="relative w-[180px] md:w-[240px] lg:w-[280px]">
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

          {/* Grouped Right-of-Search Buttons */}
          <div className="flex items-center gap-1.5">
            <button onClick={onRandomGame} className={`p-2 ${isLightMode ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'} border rounded-full text-[var(--theme)] hover:bg-[var(--theme)] hover:text-black transition-all`}>
              <Dices className="w-4 h-4" />
            </button>

            {/* Supplier Dropdown - Fixed Value Mismatches */}
            <div className="relative flex items-center">
              <select 
                value={supplier} 
                onChange={(e) => {
                  setSupplier(e.target.value);
                  localStorage.setItem('capy-supplier', e.target.value);
                }}
                className={`text-[9px] font-bold uppercase py-2 pl-2 pr-7 rounded-lg border transition-all outline-none cursor-pointer appearance-none ${
                  isLightMode 
                    ? 'bg-black/5 border-black/10 text-black' 
                    : 'bg-white/5 border-white/10 text-white'
                } focus:border-[var(--theme)]`}
              >
                {/* Ensure values match your game data tags (lowercase/kebab-case) */}
                <option value="Default">Default</option>
                <option value="gn-math">GN Math</option>
                <option value="truffled">Truffled</option>
              </select>
              <div className="absolute right-2 pointer-events-none flex items-center justify-center">
                <span style={{ fontSize: '8px', color: 'var(--theme)', opacity: 0.8 }}>▼</span>
              </div>
            </div>

            <button 
              onClick={() => setIsChatOpen(true)} 
              className={`p-2 border rounded-lg transition-all ${
                isChatOpen 
                  ? 'bg-[var(--theme)] text-black shadow-[0_0_10px_var(--theme)]' 
                  : (isLightMode ? 'bg-black/5 border-black/10 text-black' : 'bg-white/5 border-white/10 text-[var(--theme)]')
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: PROFILE & SETTINGS */}
        <div className="flex items-center justify-end gap-2 justify-self-end">
          <div className={`flex items-center gap-1 ${isLightMode ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/5'} rounded-full p-1 border`}>
              <button onClick={() => onViewProfile?.()} className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 transition-all active:scale-90">
                {profilePic ? <img src={profilePic} className="w-full h-full object-cover" alt="Profile" /> : <UserCircle className="w-full h-full p-1 text-[var(--theme)]" />}
              </button>
              <button onClick={() => setShowSettings(true)} className="p-1 transition-all hover:scale-110">
                <Settings className="w-4 h-4 text-[var(--theme)]" />
              </button>
          </div>
        </div>

      </div>
    </header>
  );
}
