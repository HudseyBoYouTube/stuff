import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  Clock, Dices, RotateCcw, Palette, Type, ImageIcon, 
  Link as LinkIcon, Upload, Battery, Calendar, Heart, Trash2, Ghost, Zap
} from 'lucide-react';

import gamesDataRaw from './games.json';

const DEFAULT_COLOR = '#10A5F5';
const DEFAULT_GLOW = 50;
const DEFAULT_TITLE = "Capybara Science";
const DEFAULT_ICON = "https://img.icons8.com/color/32/capybara.png";

const THEMES = {
  cyber: { name: 'Cyberpunk', color: '#ff0055', glow: 60 },
  midnight: { name: 'Midnight', color: '#7c3aed', glow: 40 },
  forest: { name: 'Forest', color: '#10b981', glow: 30 },
  classic: { name: 'Classic', color: DEFAULT_COLOR, glow: DEFAULT_GLOW }
};

const DISGUISE_CONFIG = {
  none: { title: DEFAULT_TITLE, icon: DEFAULT_ICON },
  drive: { title: "My Drive - Google Drive", icon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png" },
  classroom: { title: "Home - Classroom", icon: "https://www.gstatic.com/classroom/favicon.png" },
  canvas: { title: "Dashboard", icon: "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico" }
};

function App() {
  const gamesData = useMemo(() => {
    if (!gamesDataRaw || !Array.isArray(gamesDataRaw)) return [];
    return gamesDataRaw;
  }, []);

  // UI & Category States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // System & Time States
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState({ level: 100, charging: false });

  // Customization States
  const [theme, setTheme] = useState(() => localStorage.getItem('capy-theme') || DEFAULT_COLOR);
  const [glowIntensity, setGlowIntensity] = useState(() => Number(localStorage.getItem('capy-glow')) || DEFAULT_GLOW);
  const [disguise, setDisguise] = useState(() => localStorage.getItem('capy-stealth-type') || 'none');
  const [customTitle, setCustomTitle] = useState(() => localStorage.getItem('capy-custom-title') || '');
  const [customIcon, setCustomIcon] = useState(() => localStorage.getItem('capy-custom-icon') || '');

  // Panic Mode States
  const [panicUrl, setPanicUrl] = useState(() => localStorage.getItem('capy-panic-url') || 'https://google.com');
  const [panicKey, setPanicKey] = useState(() => localStorage.getItem('capy-panic-key') || 'Escape');

  // Favorites & Analytics
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('capy-favorites') || '[]'));
  const [playtimes] = useState(() => JSON.parse(localStorage.getItem('capy-playtimes') || '{}'));

  // Performance Ref to stop freezing
  const themeTimeout = useRef(null);

  // Logic: Panic Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (panicKey && e.key === panicKey) {
        window.location.href = panicUrl.startsWith('http') ? panicUrl : `https://${panicUrl}`;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicUrl, panicKey]);

  // Logic: Clock & Battery Updates
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

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    const isRemoving = favorites.includes(id);
    const newFavs = isRemoving 
      ? favorites.filter(favId => favId !== id) 
      : [...favorites, id];
    
    setFavorites(newFavs);
    localStorage.setItem('capy-favorites', JSON.stringify(newFavs));

    if (isRemoving && newFavs.length === 0 && activeCategory === 'Favorites') {
        setActiveCategory('All');
    }
  };

  // Performance-optimized Theme Applier
  const applyTheme = (t) => {
    if (themeTimeout.current) clearTimeout(themeTimeout.current);
    themeTimeout.current = setTimeout(() => {
      setTheme(t.color);
      setGlowIntensity(t.glow);
      localStorage.setItem('capy-theme', t.color);
      localStorage.setItem('capy-glow', t.glow);
      document.documentElement.style.setProperty('--theme', t.color);
      document.documentElement.style.setProperty('--glow', `${t.glow}px`);
      themeTimeout.current = null;
    }, 100);
  };

  const handleReset = () => {
    if (confirmReset) {
      localStorage.clear();
      window.location.reload();
    } else {
      setConfirmReset(true);
    }
  };

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

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return gamesData.filter(g => {
      const matchesSearch = g?.title?.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'Favorites' ? favorites.includes(g.id) : (activeCategory === 'All' || g?.category === activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, gamesData, favorites]);

  const launchContent = (item) => {
    if (!item?.url) return;
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.title = "DO NOT REFRESH";
      const link = win.document.createElement('link');
      link.rel = 'icon'; link.href = currentIdentity.icon;
      win.document.head.appendChild(link);
      win.document.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
      const iframe = win.document.createElement('iframe');
      iframe.src = item.url;
      iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
      iframe.allow = "fullscreen";
      win.document.body.appendChild(iframe);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased" style={{ '--theme': theme, '--glow': `${glowIntensity}px`, transform: 'translateZ(0)' }}>
      
      <header className="sticky top-0 z-50 border-b border-white/5 h-16 flex items-center px-4 bg-[#09090b]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
          <div className="flex items-center gap-2">
            <img src={DEFAULT_ICON} alt="Logo" className="w-7 h-7" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black hidden lg:block tracking-tighter uppercase italic">Capybara <span className="text-[var(--theme)]">Science</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full max-w-sm justify-self-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="text" 
                placeholder="Search games..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-10 text-xs outline-none focus:border-[var(--theme)]/50 transition-all" 
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest border-r border-white/10 pr-4">
              <div className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[var(--theme)]" /> {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="flex items-center gap-1.5"><Battery className={`w-3 h-3 ${battery.charging ? 'text-green-500' : 'text-[var(--theme)]'}`} /> {battery.level}%</div>
            </div>
            <button onClick={() => setShowSettings(true)} className="p-2 text-[var(--theme)] hover:opacity-70 transition-all"><Settings className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      {/* Categories Bar */}
      <nav className="max-w-7xl mx-auto px-4 mt-6 overflow-x-auto no-scrollbar flex items-center gap-2">
        {['All', 'Favorites', 'Action', 'Casual', 'Puzzle', 'Retro', 'Other'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
              activeCategory === cat 
                ? 'bg-[var(--theme)] border-[var(--theme)] text-black shadow-[0_0_15px_var(--theme)]' 
                : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredGames.map(game => (
          <div 
            key={game.id} 
            onClick={() => launchContent(game)}
            className="group bg-zinc-900/40 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-[var(--theme)]/30 transition-all flex flex-col cursor-pointer shadow-lg active:scale-95"
          >
            <div className="relative w-full aspect-[4/3] bg-black/20 overflow-hidden">
              <img src={game.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:backdrop-blur-[2px]">
                <div className="w-14 h-14 bg-[var(--theme)] rounded-full flex items-center justify-center shadow-[0_0_20px_var(--theme)]">
                  <Play className="w-7 h-7 text-black fill-current ml-1" />
                </div>
              </div>
              <button 
                onClick={(e) => toggleFavorite(game.id, e)}
                className={`absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-md transition-all ${
                  favorites.includes(game.id) ? 'bg-[var(--theme)] text-black' : 'bg-black/20 text-white hover:bg-black/40'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorites.includes(game.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
            <div className="p-6">
              <h3 className="font-black text-sm truncate tracking-tight group-hover:text-[var(--theme)] transition-colors">{game.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.2em]">{game.category}</span>
                {playtimes[game.id] && (
                  <span className="text-[9px] text-[var(--theme)] font-black uppercase flex items-center gap-1">
                    <Zap className="w-2 h-2" /> Played
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>

      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[3rem] max-w-lg w-full relative space-y-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--theme)]/10 rounded-xl">
                  <ShieldAlert className="w-6 h-6 text-[var(--theme)]" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">System <span className="text-[var(--theme)]">Core</span></h2>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="text-zinc-400" /></button>
            </div>

            {/* Panic Mode Section */}
            <section className="space-y-4">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2 px-1"><Ghost className="w-3 h-3 text-[var(--theme)]" /> Panic Protocol</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-600 font-bold uppercase ml-1">Panic Key</span>
                  <input type="text" value={panicKey} onChange={(e) => {setPanicKey(e.target.value); localStorage.setItem('capy-panic-key', e.target.value);}} className="w-full bg-zinc-800 border border-white/5 rounded-2xl p-4 text-xs font-bold outline-none focus:border-[var(--theme)]/50" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-600 font-bold uppercase ml-1">Redirect URL</span>
                  <input type="text" value={panicUrl} onChange={(e) => {setPanicUrl(e.target.value); localStorage.setItem('capy-panic-url', e.target.value);}} className="w-full bg-zinc-800 border border-white/5 rounded-2xl p-4 text-xs font-bold outline-none focus:border-[var(--theme)]/50" />
                </div>
              </div>
            </section>

            {/* Tab Customizer Section */}
            <section className="space-y-4">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2 px-1"><Type className="w-3 h-3 text-[var(--theme)]" /> Tab Identity</label>
              <div className="space-y-3">
                <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] text-zinc-600 font-bold uppercase">Custom Page Title</span>
                        <button onClick={() => {setCustomTitle(''); localStorage.removeItem('capy-custom-title');}} className="text-[8px] text-[var(--theme)] font-black uppercase hover:underline">Reset</button>
                    </div>
                    <input type="text" placeholder={DEFAULT_TITLE} value={customTitle} onChange={(e) => {setCustomTitle(e.target.value); localStorage.setItem('capy-custom-title', e.target.value);}} className="w-full bg-zinc-800 border border-white/5 rounded-2xl p-4 text-xs font-bold outline-none focus:border-[var(--theme)]/50" />
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] text-zinc-600 font-bold uppercase">Custom Icon URL</span>
                        <button onClick={() => {setCustomIcon(''); localStorage.removeItem('capy-custom-icon');}} className="text-[8px] text-[var(--theme)] font-black uppercase hover:underline">Reset</button>
                    </div>
                    <input type="text" placeholder="https://..." value={customIcon} onChange={(e) => {setCustomIcon(e.target.value); localStorage.setItem('capy-custom-icon', e.target.value);}} className="w-full bg-zinc-800 border border-white/5 rounded-2xl p-4 text-xs font-bold outline-none focus:border-[var(--theme)]/50" />
                </div>
              </div>
            </section>

            {/* Stealth Presets */}
            <section className="space-y-4">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest px-1">Stealth Disguises</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(DISGUISE_CONFIG).map(([id, config]) => (
                  <button
                    key={id}
                    onClick={() => {setDisguise(id); localStorage.setItem('capy-stealth-type', id);}}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      disguise === id ? 'bg-[var(--theme)]/10 border-[var(--theme)]' : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={config.icon} className="w-5 h-5" alt="" />
                      <span className="text-[10px] font-black uppercase tracking-tighter truncate">{id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Themes Section */}
            <section className="space-y-4">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2 px-1"><Palette className="w-3 h-3 text-[var(--theme)]" /> Visual Profiles</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(THEMES).map(([id, t]) => (
                  <button
                    key={id}
                    onClick={() => applyTheme(t)}
                    className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-left flex items-center justify-between"
                  >
                    <span className="text-[10px] font-black uppercase tracking-tighter">{t.name}</span>
                    <div className="w-3 h-3 rounded-full shadow-[0_0_10px_var(--theme)]" style={{ backgroundColor: t.color }} />
                  </button>
                ))}
              </div>
            </section>

            <div className="pt-4 border-t border-white/5 space-y-3">
              <button 
                onClick={handleReset}
                className={`w-full p-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                  confirmReset ? 'bg-red-500 text-black animate-pulse' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                {confirmReset ? 'SURE? WIPE EVERYTHING' : 'Restore Factory Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
