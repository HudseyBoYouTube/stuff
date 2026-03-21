import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  RotateCcw, Palette, Type, PlayCircle
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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const [theme, setTheme] = useState(() => localStorage.getItem('capy-theme') || DEFAULT_COLOR);
  const [glowIntensity, setGlowIntensity] = useState(() => Number(localStorage.getItem('capy-glow')) || DEFAULT_GLOW);
  const [disguise, setDisguise] = useState(() => localStorage.getItem('capy-stealth-type') || 'none');
  const [customTitle, setCustomTitle] = useState(() => localStorage.getItem('capy-custom-title') || '');
  const [customIcon, setCustomIcon] = useState(() => localStorage.getItem('capy-custom-icon') || '');

  const themeTimeout = useRef(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--theme', theme);
    document.documentElement.style.setProperty('--glow', `${glowIntensity}px`);
  }, []);

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
      const matchesCategory = activeCategory === 'All' || g?.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, gamesData]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased" style={{ '--theme': theme, '--glow': `${glowIntensity}px`, transform: 'translateZ(0)' }}>
      
      <header className="sticky top-0 z-50 border-b border-white/5 h-16 flex items-center px-4 bg-[#09090b]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
          <div className="flex items-center gap-2">
            <img src={DEFAULT_ICON} alt="Logo" className="w-7 h-7" />
            <span className="text-xl font-black hidden lg:block tracking-tighter">Capybara <span className="text-[var(--theme)]">Science</span></span>
          </div>

          <div className="flex items-center gap-2 w-full max-w-sm justify-self-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 transition-colors group-focus-within:text-[var(--theme)]" />
              <input 
                type="text" 
                placeholder="Search games..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-10 text-xs outline-none focus:border-[var(--theme)]/40 transition-all focus:bg-white/10" 
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-all active:scale-90"
                >
                  <X className="w-3 h-3 text-zinc-400 hover:text-white" />
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end items-center gap-4">
            <button onClick={() => setShowSettings(true)} className="p-2 text-[var(--theme)] hover:opacity-70 transition-all"><Settings className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredGames.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </main>

      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--theme)]"><ShieldAlert className="w-5 h-5" /> Settings</h2>
              <X onClick={() => setShowSettings(false)} className="cursor-pointer text-zinc-400 hover:text-white transition-colors" />
            </div>

            <section className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2"><Type className="w-3 h-3" /> Tab Customizer</label>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Custom Title</span>
                    <button onClick={() => { setCustomTitle(''); localStorage.removeItem('capy-custom-title'); }} className="text-[8px] text-[var(--theme)] font-black uppercase hover:underline">Reset</button>
                  </div>
                  <input type="text" placeholder={DEFAULT_TITLE} value={customTitle} onChange={(e) => { setCustomTitle(e.target.value); localStorage.setItem('capy-custom-title', e.target.value); }} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-[var(--theme)]/30" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Custom Icon URL</span>
                    <button onClick={() => { setCustomIcon(''); localStorage.removeItem('capy-custom-icon'); }} className="text-[8px] text-[var(--theme)] font-black uppercase hover:underline">Reset</button>
                  </div>
                  <input type="text" placeholder="https://..." value={customIcon} onChange={(e) => { setCustomIcon(e.target.value); localStorage.setItem('capy-custom-icon', e.target.value); }} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-[var(--theme)]/30" />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2"><Palette className="w-3 h-3" /> Themes</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(THEMES).map(([id, t]) => (
                  <button key={id} onClick={() => applyTheme(t)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold flex items-center gap-2 hover:border-[var(--theme)] transition-all">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} /> {t.name}
                  </button>
                ))}
              </div>
            </section>

            <button onClick={handleReset} className={`w-full p-4 rounded-2xl border transition-all text-[10px] font-black uppercase ${confirmReset ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10'}`}>
              <RotateCcw className="w-4 h-4 inline-block mr-2" />
              {confirmReset ? 'Confirm Full Reset?' : 'Wipe System Data'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GameCard({ game }) {
  return (
    <div className="group bg-zinc-900/40 rounded-[2rem] overflow-hidden border border-white/5 hover:border-[var(--theme)]/30 transition-all flex flex-col cursor-pointer shadow-lg hover:-translate-y-1">
      <div className="relative w-full aspect-[4/3] bg-black/20 overflow-hidden group-hover:shadow-[inset_0_0_var(--glow)_var(--theme)] transition-all duration-500">
        <img src={game.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-[var(--theme)] rounded-full flex items-center justify-center shadow-[0_0_20px_var(--theme)]">
            <PlayCircle className="w-8 h-8 text-black fill-current" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-sm truncate group-hover:text-[var(--theme)] transition-colors">{game.title}</h3>
        <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1">{game.category}</p>
      </div>
    </div>
  );
}

export default App;
