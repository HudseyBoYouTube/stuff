import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  Clock, Dices, RotateCcw, Palette, Type, ImageIcon, 
  Link as LinkIcon, Upload, Battery, Calendar, Heart, Trash2, Ghost, Zap, Video
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

const updateThemeVariables = (color, glow) => {
  const root = document.documentElement;
  root.style.setProperty('--theme', color);
  root.style.setProperty('--glow', `${glow}px`);
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

  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState({ level: 100, charging: false });

  const [theme, setTheme] = useState(() => localStorage.getItem('capy-theme') || DEFAULT_COLOR);
  const [glowIntensity, setGlowIntensity] = useState(() => Number(localStorage.getItem('capy-glow')) || DEFAULT_GLOW);
  const [disguise, setDisguise] = useState(() => localStorage.getItem('capy-stealth-type') || 'none');
  const [customTitle, setCustomTitle] = useState(() => localStorage.getItem('capy-custom-title') || '');
  const [customIcon, setCustomIcon] = useState(() => localStorage.getItem('capy-custom-icon') || '');

  // Background States
  const [backgroundImage, setBackgroundImage] = useState(() => localStorage.getItem('capy-bg-image') || '');
  const [backgroundVideo, setBackgroundVideo] = useState(() => localStorage.getItem('capy-bg-video') || '');
  const [bgOpacity, setBgOpacity] = useState(() => Number(localStorage.getItem('capy-bg-opacity')) || 50);

  const [panicUrl, setPanicUrl] = useState(() => localStorage.getItem('capy-panic-url') || 'https://google.com');
  const [panicKey, setPanicKey] = useState(() => localStorage.getItem('capy-panic-key') || 'Escape');

  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('capy-favorites') || '[]'));
  const [playtimes] = useState(() => JSON.parse(localStorage.getItem('capy-playtimes') || '{}'));

  useEffect(() => {
    updateThemeVariables(theme, glowIntensity);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (panicKey && e.key === panicKey) {
        window.location.href = panicUrl.startsWith('http') ? panicUrl : `https://${panicUrl}`;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicUrl, panicKey]);

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

  useEffect(() => {
    if (confirmReset) {
      const timeout = setTimeout(() => setConfirmReset(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [confirmReset]);

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        if (file.type.startsWith('video/')) {
          setBackgroundVideo(base64String);
          localStorage.setItem('capy-bg-video', base64String);
        } else {
          setBackgroundImage(base64String);
          localStorage.setItem('capy-bg-image', base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setCustomIcon(base64String);
        localStorage.setItem('capy-custom-icon', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const applyTheme = (t) => {
    setTheme(t.color);
    setGlowIntensity(t.glow);
    localStorage.setItem('capy-theme', t.color);
    localStorage.setItem('capy-glow', t.glow);
    updateThemeVariables(t.color, t.glow);
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

  const validFavoritesCount = useMemo(() => gamesData.filter(g => favorites.includes(g.id)).length, [gamesData, favorites]);

  const categoriesWithCounts = useMemo(() => {
    const uniqueCats = [...new Set(gamesData.map(g => g?.category).filter(Boolean))];
    const final = [{ name: 'All', count: gamesData.length }];
    if (validFavoritesCount > 0) final.unshift({ name: 'Favorites', count: validFavoritesCount });
    uniqueCats.forEach(cat => {
      final.push({ name: cat, count: gamesData.filter(g => g.category === cat).length });
    });
    return final;
  }, [gamesData, validFavoritesCount]);

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

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return gamesData.filter(g => {
      const isUtility = g.id === 'request' || g.id === 'report';
      const matchesSearch = g?.title?.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'Favorites' ? favorites.includes(g.id) : (activeCategory === 'All' || g?.category === activeCategory);
      
      // Always show Utility items regardless of Category if searching, or if they match the category
      return (matchesSearch && matchesCategory) || (isUtility && matchesSearch);
    });
  }, [searchQuery, activeCategory, gamesData, favorites]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased relative" style={{ '--theme': theme, '--glow': `${glowIntensity}px` }}>
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ opacity: bgOpacity / 100 }}>
        {backgroundVideo ? (
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={backgroundVideo} />
          </video>
        ) : backgroundImage ? (
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
        ) : null}
      </div>

      <div className="relative z-10">
        <div className="sticky top-0 z-50">
          <header className="border-b border-white/5 h-16 flex items-center px-4 bg-[#09090b]/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
              <div className="flex items-center gap-2">
                <img src={DEFAULT_ICON} alt="Logo" className="w-7 h-7 object-contain" />
                <span className="text-xl font-black hidden lg:block tracking-tighter">Capybara <span className="text-[var(--theme)]">Science</span></span>
              </div>

              <div className="flex items-center gap-2 w-full max-w-sm justify-self-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input type="text" placeholder="Search games..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-10 text-xs outline-none focus:border-[var(--theme)]/50 transition-colors" />
                </div>
                <button onClick={() => {
                  const playable = gamesData.filter(g => !['request', 'report'].includes(g.id));
                  if (playable.length > 0) launchContent(playable[Math.floor(Math.random() * playable.length)]);
                }} className="p-2 bg-white/5 border border-white/10 rounded-full text-[var(--theme)] hover:bg-[var(--theme)] hover:text-black transition-all shrink-0">
                  <Dices className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-4">
                <div className="hidden sm:flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-[var(--theme)] bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <div className="flex items-center gap-1 border-l border-white/10 pl-3">
                    <Battery className={`w-3 h-3 ${battery.charging ? 'text-green-500' : ''}`} />
                    <span>{battery.level}%</span>
                  </div>
                </div>
                <button onClick={() => setShowSettings(true)} className="p-2 text-[var(--theme)] hover:opacity-70 transition-all"><Settings className="w-6 h-6" /></button>
              </div>
            </div>
          </header>

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
            <GameCard 
              key={game.id} 
              game={game} 
              onLaunch={launchContent} 
              playtime={playtimes[game.id] ? Math.floor(playtimes[game.id]/60) + 'm' : '0m'}
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={(e) => toggleFavorite(game.id, e)}
            />
          ))}
        </main>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--theme)]"><ShieldAlert className="w-5 h-5" /> System Config</h2>
              <X onClick={() => setShowSettings(false)} className="cursor-pointer text-zinc-400 hover:text-white" />
            </div>
            
            <div className="space-y-6">
              {/* Background Section */}
              <section className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2"><ImageIcon className="w-3 h-3 text-[var(--theme)]" /> Media Background</label>
                <div className="flex gap-2">
                  <label className="flex-1 p-3 bg-zinc-800 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:border-[var(--theme)]/50 transition-all text-center cursor-pointer">
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="w-3 h-3 text-[var(--theme)]" />
                      Upload IMG/GIF/MP4
                    </div>
                    <input type="file" accept="image/*,video/*" onChange={handleBackgroundUpload} className="hidden" />
                  </label>
                  {(backgroundImage || backgroundVideo) && (
                    <button onClick={() => { setBackgroundImage(''); setBackgroundVideo(''); localStorage.removeItem('capy-bg-image'); localStorage.removeItem('capy-bg-video'); }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  )}
                </div>
                {(backgroundImage || backgroundVideo) && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8px] font-black uppercase text-zinc-500">
                      <span>Opacity</span>
                      <span>{bgOpacity}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={bgOpacity} onChange={(e) => { setBgOpacity(e.target.value); localStorage.setItem('capy-bg-opacity', e.target.value); }} className="w-full accent-[var(--theme)]" />
                  </div>
                )}
              </section>

              <section className="space-y-4 bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] uppercase font-black text-red-500 tracking-widest flex items-center gap-2">
                    <Ghost className="w-3 h-3" /> Panic Mode
                  </label>
                  <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase">
                    {panicKey ? `Active: ${panicKey}` : 'Disabled'}
                  </span>
                </div>
                <div className="space-y-3">
                  <input type="text" placeholder="Redirect URL (google.com)" value={panicUrl} onChange={(e) => { setPanicUrl(e.target.value); localStorage.setItem('capy-panic-url', e.target.value); }} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-red-500/50" />
                  <input type="text" placeholder="Press key to set Panic" value={panicKey} onKeyDown={(e) => { e.preventDefault(); setPanicKey(e.key); localStorage.setItem('capy-panic-key', e.key); }} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-red-500/50 text-center font-mono font-bold" readOnly />
                </div>
              </section>

              <section className="space-y-3">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2"><Palette className="w-3 h-3" /> Capy-Themes</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(THEMES).map(([id, t]) => (
                    <button key={id} onClick={() => applyTheme(t)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold hover:border-[var(--theme)] flex items-center gap-2 transition-all">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} /> {t.name}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2"><Zap className="w-3 h-3" /> Stealth Presets</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(DISGUISE_CONFIG).map(type => (
                    <button key={type} onClick={() => { setDisguise(type); localStorage.setItem('capy-stealth-type', type); }} className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase border transition-all ${disguise === type ? 'bg-[var(--theme)] text-black' : 'bg-zinc-800 border-white/5'}`}>{type}</button>
                  ))}
                </div>
                <div className="pt-2 space-y-2">
                  <input type="text" placeholder="Custom Tab Title" value={customTitle} onChange={(e) => { setCustomTitle(e.target.value); localStorage.setItem('capy-custom-title', e.target.value); }} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs outline-none" />
                  <div className="flex gap-2">
                    <input type="text" placeholder="Custom Favicon URL" value={customIcon} onChange={(e) => { setCustomIcon(e.target.value); localStorage.setItem('capy-custom-icon', e.target.value); }} className="flex-1 bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs outline-none" />
                    <label className="p-3 bg-zinc-800 border border-white/10 rounded-xl hover:border-[var(--theme)]/50 transition-all cursor-pointer">
                      <Upload className="w-4 h-4 text-[var(--theme)]" />
                      <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </section>

              <button onClick={handleReset} className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase ${confirmReset ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10'}`}>
                <RotateCcw className={`w-4 h-4 ${confirmReset ? 'animate-spin' : ''}`} />
                {confirmReset ? 'Confirm Full Reset?' : 'Wipe System Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GameCard({ game, onLaunch, playtime, isFavorite, onToggleFavorite }) {
  const isUtility = ['request', 'report'].includes(game.id);
  return (
    <div className="group bg-zinc-900/40 rounded-[2rem] overflow-hidden border border-white/5 hover:border-[var(--theme)]/30 transition-all flex flex-col cursor-pointer shadow-lg" onClick={() => onLaunch(game)}>
      <div className="relative w-full aspect-[4/3] bg-black/20 overflow-hidden group-hover:shadow-[inset_0_0_var(--glow)_var(--theme)] transition-all duration-500">
        <img src={game.thumbnail} className={`absolute inset-0 m-auto transition-transform duration-500 group-hover:scale-110 ${isUtility ? 'w-24 h-24 object-contain' : 'w-full h-full object-cover'}`} alt="" />
        {!isUtility && (
          <button onClick={onToggleFavorite} className="absolute top-4 right-4 z-10 p-2 bg-zinc-900/80 backdrop-blur-sm rounded-full border border-white/10 hover:scale-110 transition-transform shadow-lg">
            <Heart className={`w-4 h-4 transition-colors`} stroke={isFavorite ? "var(--theme)" : "#71717a"} strokeWidth={2.5} fill={isFavorite ? 'var(--theme)' : 'none'} />
          </button>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-[var(--theme)] rounded-full flex items-center justify-center shadow-[0_0_20px_var(--theme)]">
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
