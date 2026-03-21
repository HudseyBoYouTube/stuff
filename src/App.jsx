import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  Clock, Dices, RotateCcw, Palette, Type, ImageIcon, 
  Link as LinkIcon, Upload, Battery, Calendar
} from 'lucide-react';

import gamesDataRaw from './games.json';

const DEFAULT_COLOR = '#10A5F5';
const DEFAULT_GLOW = 50;
const DEFAULT_TITLE = "Capybara Science";
const DEFAULT_ICON = "https://img.icons8.com/color/32/capybara.png";

const DISGUISE_CONFIG = {
  none: { title: DEFAULT_TITLE, icon: DEFAULT_ICON },
  drive: { title: "My Drive - Google Drive", icon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png" },
  classroom: { title: "Home", icon: "https://www.gstatic.com/classroom/favicon.png" },
  canvas: { title: "Dashboard", icon: "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico" }
};

function App() {
  const gamesData = useMemo(() => {
    if (!gamesDataRaw || !Array.isArray(gamesDataRaw)) return [];
    return gamesDataRaw;
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState({ level: 100, charging: false });

  const [theme, setTheme] = useState(() => localStorage.getItem('capy-theme') || DEFAULT_COLOR);
  const [glowIntensity, setGlowIntensity] = useState(() => Number(localStorage.getItem('capy-glow')) || DEFAULT_GLOW);
  const [disguise, setDisguise] = useState(() => localStorage.getItem('capy-stealth-type') || 'none');
  const [customTitle, setCustomTitle] = useState(() => localStorage.getItem('capy-custom-title') || '');
  const [customIcon, setCustomIcon] = useState(() => localStorage.getItem('capy-custom-icon') || '');

  const [favorites] = useState(() => JSON.parse(localStorage.getItem('capy-favorites') || '[]'));
  const [playtimes] = useState(() => JSON.parse(localStorage.getItem('capy-playtimes') || '{}'));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    if ('getBattery' in navigator) {
      navigator.getBattery().then(bat => {
        const updateBat = () => setBattery({ level: Math.round(bat.level * 100), charging: bat.charging });
        bat.addEventListener('levelchange', updateBat);
        bat.addEventListener('chargingchange', updateBat);
        updateBat();
      });
    }
    return () => clearInterval(timer);
  }, []);

  const currentIdentity = useMemo(() => {
    if (disguise !== 'none') return DISGUISE_CONFIG[disguise] || DISGUISE_CONFIG.none;
    return { title: customTitle || DEFAULT_TITLE, icon: customIcon || DEFAULT_ICON };
  }, [disguise, customTitle, customIcon]);

  useEffect(() => {
    document.title = currentIdentity.title;
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = currentIdentity.icon;
  }, [currentIdentity]);

  const categoriesWithCounts = useMemo(() => {
    const uniqueCats = [...new Set(gamesData.map(g => g?.category).filter(Boolean))];
    const final = [{ name: 'All', count: gamesData.length }];
    uniqueCats.forEach(cat => {
      final.push({ name: cat, count: gamesData.filter(g => g.category === cat).length });
    });
    if (favorites.length > 0) final.unshift({ name: 'Favorites', count: favorites.length });
    return final;
  }, [gamesData, favorites]);

  const launchContent = (item) => {
    if (!item?.url) return;
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.title = "DO NOT REFRESH";
      const link = win.document.createElement('link');
      link.rel = 'icon';
      link.href = currentIdentity.icon;
      win.document.head.appendChild(link);

      win.document.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
      const iframe = win.document.createElement('iframe');
      iframe.src = item.url;
      iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
      iframe.allow = "fullscreen";
      win.document.body.appendChild(iframe);
      
      const titleInterval = setInterval(() => {
        if (win.document.title !== "DO NOT REFRESH") win.document.title = "DO NOT REFRESH";
      }, 500);
      win.onbeforeunload = () => clearInterval(titleInterval);
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

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased" style={{ '--theme': theme, '--glow': `${glowIntensity}px` }}>
      
      <div className="sticky top-0 z-50">
        <header className="border-b border-white/5 h-16 flex items-center px-4 bg-[#09090b]/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
            {/* LEFT: LOGO */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center transition-all">
                <img src={DEFAULT_ICON} alt="Logo" className="w-7 h-7 object-contain" />
              </div>
              <span className="text-xl font-black hidden lg:block tracking-tighter">Capybara <span className="text-[var(--theme)]">Science</span></span>
            </div>

            {/* CENTER: SEARCH BAR */}
            <div className="flex items-center gap-2 w-full max-w-sm justify-self-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input type="text" placeholder="Search games..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-10 text-xs outline-none focus:border-[var(--theme)]/50 transition-colors" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button onClick={() => {
                const playable = gamesData.filter(g => !['request', 'report'].includes(g.id));
                if (playable.length > 0) launchContent(playable[Math.floor(Math.random() * playable.length)]);
              }} className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-[var(--theme)] hover:text-black transition-all shrink-0">
                <Dices className="w-5 h-5" />
              </button>
            </div>

            {/* RIGHT: DATE, TIME, BATTERY & SETTINGS */}
            <div className="flex items-center justify-end gap-4">
              <div className="hidden sm:flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-[var(--theme)] bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {time.toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="flex items-center gap-1 border-l border-white/10 pl-3">
                  <Battery className={`w-3 h-3 ${battery.charging ? 'text-green-500' : ''}`} />
                  <span>{battery.level}%</span>
                </div>
              </div>
              {/* Updated settings icon color to match the info bar */}
              <button onClick={() => setShowSettings(true)} className="p-2 text-[var(--theme)] hover:opacity-70 transition-all"><Settings className="w-6 h-6" /></button>
            </div>
          </div>
        </header>

        {/* STICKY CATEGORY BAR */}
        <div className="bg-[#09090b]/90 backdrop-blur-md border-b border-white/5 px-4 pt-1.5 overflow-hidden">
          <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {categoriesWithCounts.map(cat => (
              <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border shrink-0 transition-all ${activeCategory === cat.name ? 'bg-[var(--theme)] border-[var(--theme)] text-black' : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'}`}>
                {cat.name} <span className="opacity-40 ml-1">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredGames.map(game => (
          <GameCard key={game.id} game={game} onLaunch={launchContent} playtime={playtimes[game.id] ? Math.floor(playtimes[game.id]/60) + 'm' : '0m'} />
        ))}
      </main>

      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--theme)]"><ShieldAlert className="w-5 h-5" /> System Config</h2>
              <X onClick={() => setShowSettings(false)} className="cursor-pointer text-zinc-400 hover:text-white" />
            </div>
            
            <div className="space-y-6">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col gap-2">
                <span className="text-[8px] uppercase font-black text-zinc-600 tracking-widest text-center">Live Disguise Preview</span>
                <div className="bg-[#18181b] rounded-lg p-2 flex items-center gap-3 border border-white/10 shadow-inner">
                  <img src={currentIdentity.icon} className="w-4 h-4 object-contain" alt="" onError={(e) => e.target.src = DEFAULT_ICON} />
                  <span className="text-[11px] font-medium text-zinc-300 truncate">{currentIdentity.title}</span>
                </div>
              </div>

              <section className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2"><Palette className="w-3 h-3" /> Custom Branding</label>
                <input type="text" placeholder="Custom Tab Title" value={customTitle} onChange={(e) => { setCustomTitle(e.target.value); localStorage.setItem('capy-custom-title', e.target.value); }} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-[var(--theme)]/50 transition-colors" />
                <div className="flex gap-2">
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const r = new FileReader();
                      r.onloadend = () => { setCustomIcon(r.result); localStorage.setItem('capy-custom-icon', r.result); };
                      r.readAsDataURL(file);
                    }
                  }} className="hidden" id="icon-up-centered" />
                  <label htmlFor="icon-up-centered" className="w-12 h-12 bg-zinc-800 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-[var(--theme)] transition-all"><Upload className="w-4 h-4 text-zinc-500" /></label>
                  <div className="relative flex-1">
                    <input type="text" placeholder="Icon URL" value={customIcon.startsWith('data:') ? 'Local File' : customIcon} onChange={(e) => { setCustomIcon(e.target.value); localStorage.setItem('capy-custom-icon', e.target.value); }} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 pr-10 text-xs outline-none focus:border-[var(--theme)]/50" />
                    {customIcon && (
                      <button onClick={() => { setCustomIcon(''); localStorage.removeItem('capy-custom-icon'); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[var(--theme)] transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-[10px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GameCard({ game, onLaunch, playtime }) {
  const isUtility = ['request', 'report'].includes(game.id);
  return (
    <div className="group bg-zinc-900/40 rounded-[2rem] overflow-hidden border border-white/5 hover:border-[var(--theme)]/30 transition-all flex flex-col cursor-pointer shadow-lg" onClick={() => onLaunch(game)}>
      <div className="relative w-full aspect-[4/3] bg-black/20 overflow-hidden group-hover:shadow-[inset_0_0_var(--glow)_var(--theme)] transition-all duration-500">
        <img src={game.thumbnail} className={`absolute inset-0 m-auto transition-transform duration-500 group-hover:scale-110 ${isUtility ? 'w-24' : 'w-full h-full object-cover'}`} alt="" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-[var(--theme)] rounded-full flex items-center justify-center shadow-[0_0_20px_var(--theme)] transition-all">
            <Play className="w-6 h-6 text-black fill-current ml-1" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-sm truncate group-hover:text-[var(--theme)] transition-colors">{game.title}</h3>
          {!isUtility && <span className="text-[8px] text-zinc-600 font-bold bg-white/5 px-1.5 py-0.5 rounded shrink-0">{playtime}</span>}
        </div>
        <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1">{game.category}</p>
      </div>
    </div>
  );
}

export default App;
