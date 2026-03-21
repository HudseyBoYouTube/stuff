import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  Star, Trash2, Palette, EyeOff, Eye, 
  Dices, AlertTriangle, Battery, Zap, ChevronDown, Upload
} from 'lucide-react';

import gamesDataRaw from './games.json';

const DISGUISE_CONFIG = {
  none: { title: "Capybara Science" },
  drive: { title: "My Drive - Google Drive", icon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png" },
  classroom: { title: "Home - Classroom", icon: "https://www.gstatic.com/classroom/favicon.png" },
  canvas: { title: "Dashboard", icon: "https://du11hjcvhe620.cloudfront.net/favicon.ico" }
};

function App() {
  const [dataError, setDataError] = useState(false);
  const fileInputRef = useRef(null);

  const gamesData = useMemo(() => {
    try {
      if (!gamesDataRaw || !Array.isArray(gamesDataRaw)) return [];
      return gamesDataRaw;
    } catch (e) {
      setDataError(true);
      return [];
    }
  }, []);

  // STATES
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('capy-theme') || '#10A5F5');
  const [disguise, setDisguise] = useState(() => localStorage.getItem('capy-stealth-type') || 'none');
  const [customFavicon, setCustomFavicon] = useState(() => localStorage.getItem('capy-custom-icon') || null);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('capy-favorites') || '[]'));
  const [confirmClear, setConfirmClear] = useState(false);

  // CLOCK & BATTERY LOGIC
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        setBatteryLevel(Math.floor(battery.level * 100));
        setIsCharging(battery.charging);
        battery.addEventListener('levelchange', () => setBatteryLevel(Math.floor(battery.level * 100)));
        battery.addEventListener('chargingchange', () => setIsCharging(battery.charging));
      });
    }
    return () => clearInterval(timer);
  }, []);

  // TAB DISGUISE EFFECT
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    const selected = DISGUISE_CONFIG[disguise] || DISGUISE_CONFIG.none;
    
    document.title = selected.title;
    if (disguise === 'none') {
      link.href = customFavicon || '/vite.svg';
    } else {
      link.href = selected.icon;
    }
    document.getElementsByTagName('head')[0].appendChild(link);
    localStorage.setItem('capy-stealth-type', disguise);
  }, [disguise, customFavicon]);

  // HANDLERS
  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomFavicon(reader.result);
        localStorage.setItem('capy-custom-icon', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const launchGame = (game) => {
    if (!game?.url) return;
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.title = "DO NOT REFRESH";
      win.document.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
      const iframe = win.document.createElement('iframe');
      iframe.src = game.url;
      iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
      iframe.allow = "fullscreen";
      win.document.body.appendChild(iframe);
    }
  };

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return gamesData.filter(g => {
      const matchesSearch = g?.title?.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'Favorites' ? favorites.includes(g.id) : (activeCategory === 'All' || g?.category === activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, gamesData, favorites]);

  const categoriesWithCounts = useMemo(() => {
    const uniqueCats = [...new Set(gamesData.map(g => g?.category).filter(Boolean))];
    const final = [{ name: 'All', count: gamesData.length }, ...uniqueCats.map(cat => ({ name: cat, count: gamesData.filter(g => g.category === cat).length }))];
    if (favorites.length > 0) final.unshift({ name: 'Favorites', count: favorites.length });
    return final;
  }, [gamesData, favorites]);

  if (dataError) return <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">Error Loading Data</div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased" style={{ '--theme': theme }}>
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/5 h-16 flex items-center px-4 bg-[#09090b]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 bg-[var(--theme)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--theme)]/20"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-black hidden lg:block tracking-tighter">Capybara <span className="text-[var(--theme)]">Science</span></span>
          </div>

          <div className="flex items-center gap-2 w-full max-w-sm mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-10 text-xs outline-none focus:border-[var(--theme)]/50 text-center" />
              {searchQuery.length > 0 && <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 cursor-pointer" onClick={() => setSearchQuery('')} />}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
             <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-500 hover:text-[var(--theme)] shrink-0"><Settings className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      {/* CATEGORIES */}
      <div className="sticky top-16 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-white/5 px-4 pt-1.5 mb-[-1rem]">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-4">
          {categoriesWithCounts.map(cat => (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border shrink-0 transition-all ${activeCategory === cat.name ? 'bg-[var(--theme)] border-[var(--theme)] text-black' : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredGames.map(game => (
          <GameCard key={game.id} game={game} isFav={favorites.includes(game.id)} onLaunch={launchGame} onFav={setFavorites} />
        ))}
      </main>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative z-10 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-[var(--theme)]" /> System Config</h2>
            
            {/* DISGUISE SELECT */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <label className="text-sm block mb-2 font-bold">Tab Disguise</label>
              <select value={disguise} onChange={(e) => setDisguise(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs outline-none">
                <option value="none">Default (Capybara Science)</option>
                <option value="drive">Google Drive</option>
                <option value="classroom">Google Classroom</option>
                <option value="canvas">Canvas Dashboard</option>
              </select>
            </div>

            {/* FAVICON UPLOAD */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <label className="text-sm block mb-2 font-bold">Custom Favicon (Default Mode)</label>
              <div className="flex items-center gap-3">
                <button onClick={() => fileInputRef.current.click()} className="flex-1 p-3 bg-zinc-800 rounded-xl text-[10px] flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-[var(--theme)] transition-colors">
                  <Upload className="w-3 h-3" /> Upload Icon
                </button>
                {customFavicon && <button onClick={() => { setCustomFavicon(null); localStorage.removeItem('capy-custom-icon'); }} className="p-3 text-red-500 text-[10px] font-bold">Reset</button>}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFaviconUpload} accept="image/*" className="hidden" />
            </div>

            {/* THEME + HEX INPUT */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold flex items-center gap-2"><Palette className="w-4 h-4" /> Theme Color</label>
                <div className="flex items-center gap-2">
                  <input type="text" value={theme} onChange={(e) => { setTheme(e.target.value); localStorage.setItem('capy-theme', e.target.value); }} className="w-20 bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono outline-none focus:border-[var(--theme)]" />
                  <div className="w-6 h-6 rounded-full border border-white/20 relative" style={{ background: theme }}>
                    <input type="color" value={theme.length === 7 ? theme : '#10A5F5'} onChange={(e) => { setTheme(e.target.value); localStorage.setItem('capy-theme', e.target.value); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setShowSettings(false)} className="w-full p-4 bg-[var(--theme)] text-black font-black rounded-2xl uppercase text-xs tracking-widest">Save & Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function GameCard({ game, isFav, onLaunch, onFav }) {
  const isUtility = ['request', 'report'].includes(game.id);
  return (
    <div className="group bg-zinc-900/40 rounded-[2rem] overflow-hidden border border-white/5 hover:border-[var(--theme)]/30 transition-all flex flex-col cursor-pointer" onClick={() => onLaunch(game)}>
      <div className="relative aspect-[4/3] bg-black/20">
        <img src={game.thumbnail} className={`absolute inset-0 m-auto transition-transform duration-500 group-hover:scale-110 ${isUtility ? 'w-24 object-contain' : 'w-full h-full object-cover'}`} alt="" />
        {!isUtility && (
          <button onClick={(e) => { e.stopPropagation(); const saved = JSON.parse(localStorage.getItem('capy-favorites') || '[]'); const next = saved.includes(game.id) ? saved.filter(id => id !== game.id) : [...saved, game.id]; localStorage.setItem('capy-favorites', JSON.stringify(next)); onFav(next); }} className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md ${isFav ? 'bg-[var(--theme)] text-black' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'}`}>
            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-10 h-10 text-[var(--theme)] fill-current" /></div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-sm truncate group-hover:text-[var(--theme)]">{game.title}</h3>
        <p className="text-[9px] text-zinc-500 uppercase font-black">{game.category}</p>
      </div>
    </div>
  );
}

export default App;
