import { useState, useMemo, useEffect } from 'react';
import { Search, Gamepad2, Play, Settings, X, ShieldAlert, Heart, Sun, Moon, Zap, ZapOff, Filter, Clock, Trash2, Dices, Battery, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gamesData from './games.json';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(() => localStorage.getItem('perf-mode') === 'true');
  const [panicUrl, setPanicUrl] = useState(localStorage.getItem('panic-url') || 'https://classroom.google.com');
  const [panicKey, setPanicKey] = useState(localStorage.getItem('panic-key') || 'Escape');
  const [isRecording, setIsRecording] = useState(false);
  const [panicEnabled, setPanicEnabled] = useState(localStorage.getItem('panic-enabled') !== 'false');
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('theme') === 'light');
  const [customCloakUrl, setCustomCloakUrl] = useState(localStorage.getItem('custom-cloak-url') || '');
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [battery, setBattery] = useState({ level: 100, charging: false });

  const [playtimes, setPlaytimes] = useState(() => {
    const saved = localStorage.getItem('game-playtimes');
    try { return saved ? JSON.parse(saved) : {}; } catch { return {}; }
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorite-games');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(bat => {
        const updateBattery = () => setBattery({ level: Math.round(bat.level * 100), charging: bat.charging });
        updateBattery();
        bat.addEventListener('levelchange', updateBattery);
        bat.addEventListener('chargingchange', updateBattery);
      });
    }
  }, []);

  const categories = useMemo(() => {
    const cats = (gamesData || []).map(g => g.category);
    return ['All', ...new Set(cats.filter(Boolean))];
  }, []);

  const presets = {
    none: { title: 'Capybara Science', favicon: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' },
    powerschool: { title: 'PowerSchool', favicon: 'https://www.powerschool.com/favicon.ico' },
    google: { title: 'My Drive - Google Drive', favicon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' }
  };

  const applyCloak = (url) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      const rawName = domain.replace('www.', '').split('.')[0]; 
      const formattedTitle = rawName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      const icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      document.title = formattedTitle;
      let l = document.querySelector("link[rel*='icon']");
      if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
      l.href = icon;
      localStorage.setItem('cloaked-title', formattedTitle);
      localStorage.setItem('cloaked-icon', icon);
    } catch (e) { document.title = 'Capybara Science'; }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLightMode);
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  useEffect(() => { localStorage.setItem('perf-mode', performanceMode); }, [performanceMode]);
  useEffect(() => { localStorage.setItem('favorite-games', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('game-playtimes', JSON.stringify(playtimes)); }, [playtimes]);

  useEffect(() => {
    const handleFocus = () => {
      const activeGame = sessionStorage.getItem('active-game-id');
      const startTime = sessionStorage.getItem('active-game-start');
      if (activeGame && startTime) {
        const elapsedMs = Date.now() - parseInt(startTime);
        const elapsedMins = Math.floor(elapsedMs / 60000);
        if (elapsedMins > 0) {
          setPlaytimes(prev => ({ ...prev, [activeGame]: (prev[activeGame] || 0) + elapsedMins }));
        }
        sessionStorage.removeItem('active-game-id');
        sessionStorage.removeItem('active-game-start');
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleSelectGame = (game) => {
    sessionStorage.setItem('active-game-id', game.id);
    sessionStorage.setItem('active-game-start', Date.now().toString());
    const win = window.open('about:blank', '_blank');
    if (!win) return;
    win.document.title = 'DO NOT REFRESH';
    const doc = win.document;
    doc.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
    const iframe = doc.createElement('iframe');
    iframe.src = game.url;
    iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";
    doc.body.appendChild(iframe);
  };

  const handleRandomGame = () => {
    if (gamesData.length === 0) return;
    const randomIdx = Math.floor(Math.random() * gamesData.length);
    handleSelectGame(gamesData[randomIdx]);
  };

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (gamesData || []).filter(g => {
      const matchesSearch = g.title?.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || g.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const favs = useMemo(() => filteredGames.filter(g => favorites.includes(g.id)), [filteredGames, favorites]);
  const others = useMemo(() => filteredGames.filter(g => !favorites.includes(g.id)), [filteredGames, favorites]);

  const BatteryIcon = () => {
    const isLow = battery.level <= 20 && !battery.charging;
    const iconClass = `w-4 h-4 ${isLow ? 'text-red-500 animate-pulse' : ''}`;

    if (battery.charging) return <BatteryCharging className="w-4 h-4 text-emerald-500" />;
    if (battery.level > 80) return <BatteryFull className={iconClass || "text-[#10A5F5]"} />;
    if (battery.level > 30) return <BatteryMedium className={iconClass || "text-zinc-400"} />;
    return <BatteryLow className={iconClass || "text-red-500"} />;
  };

  const GameCard = ({ game }) => {
    const isUtility = ['request', 'report'].includes(game.id);
    const timeSpent = playtimes[game.id] || 0;
    return (
      <motion.div layout={!performanceMode} initial={performanceMode ? { opacity: 1 } : { opacity: 0 }} animate={{ opacity: 1 }} whileHover={performanceMode ? {} : { y: -4 }}
        className="group bg-[var(--card-bg)] border border-white/5 rounded-2xl overflow-hidden cursor-pointer flex flex-col" onClick={() => handleSelectGame(game)}>
        <div className="relative aspect-[4/3] bg-zinc-800/20 overflow-hidden shrink-0">
          <img src={game.thumbnail} alt={game.title} referrerPolicy="no-referrer" className={`absolute inset-0 w-full h-full ${performanceMode ? '' : 'transition-transform duration-500 group-hover:scale-110'} ${isUtility ? 'object-contain p-6' : 'object-cover'}`} />
          <button onClick={(e) => { e.stopPropagation(); setFavorites(p => p.includes(game.id) ? p.filter(id => id !== game.id) : [...p, game.id]); }} 
            className={`absolute top-3 right-3 z-10 p-2 rounded-full border border-white/10 ${performanceMode ? 'bg-black' : 'bg-black/40 backdrop-blur-md'} transition-colors hover:bg-black/60`}>
            <Heart className={`w-4 h-4 ${favorites.includes(game.id) ? 'fill-[#10A5F5] text-[#10A5F5]' : 'text-white'}`} />
          </button>
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className={`w-12 h-12 bg-[#10A5F5] rounded-full flex items-center justify-center shadow-xl ${performanceMode ? '' : 'transform translate-y-4 group-hover:translate-y-0 transition-transform'}`}>
              <Play className="w-6 h-6 text-black fill-current" />
            </div>
          </div>
        </div>
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h3 className="font-semibold text-[var(--text-main)] group-hover:text-[#10A5F5] truncate text-sm">{game.title}</h3>
            <span className="text-[9px] font-bold uppercase text-[#10A5F5] px-2 py-0.5 bg-[#10A5F5]/10 rounded-md shrink-0 border border-[#10A5F5]/20">{game.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-zinc-500">{isUtility ? 'Click to fill out' : 'Click to play'}</p>
            {!isUtility && timeSpent > 0 && <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium"><Clock className="w-3 h-3" />{timeSpent >= 60 ? `${Math.floor(timeSpent/60)}h ${timeSpent%60}m` : `${timeSpent}m`}</div>}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pb-20">
      <header className={`sticky top-0 z-40 border-b border-white/5 bg-[var(--bg-main)]/80 ${performanceMode ? '' : 'backdrop-blur-xl'} h-16 flex items-center px-4`}>
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
          
          <div className="flex items-center gap-2 justify-self-start">
            <div className="w-8 h-8 bg-[#10A5F5] rounded-lg flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-bold hidden sm:block">Capybara <span className="text-[#10A5F5]">Science</span></span>
          </div>

          <div className="flex items-center gap-2 w-full max-w-md justify-self-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input type="text" placeholder="Search games..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-10 text-sm outline-none focus:border-[#10A5F5]/50" />
              {searchQuery && <X onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 cursor-pointer text-zinc-500" />}
            </div>
            <button onClick={handleRandomGame} title="Random Game" className="p-2 bg-white/5 border border-white/10 rounded-full text-zinc-400 hover:text-[#10A5F5] transition-all"><Dices className="w-5 h-5" /></button>
          </div>

          <div className="flex items-center gap-4 justify-self-end">
            {/* Extended System Dashboard */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/5 rounded-full">
              <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                  {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
                <BatteryIcon />
                <span className={`text-[11px] font-bold ${battery.level <= 20 && !battery.charging ? 'text-red-500' : 'text-zinc-400'}`}>
                  {battery.level}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#10A5F5]" />
                <span className="text-[11px] font-bold text-zinc-200">
                  {/* Clean time: AM/PM included, no leading zero */}
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => setIsLightMode(!isLightMode)} className="p-2 text-zinc-400 hover:text-[#10A5F5]">{isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}</button>
              <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-400 hover:text-[#10A5F5]"><Settings className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${activeCategory === cat ? 'bg-[#10A5F5] border-[#10A5F5] text-black' : 'bg-white/5 border-white/10 text-zinc-400 hover:border-[#10A5F5]/50'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 ${performanceMode ? '' : 'backdrop-blur-sm'}`}>
            <motion.div initial={performanceMode ? {} : { scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-black border border-white/10 p-6 rounded-2xl max-w-sm w-full relative shadow-2xl">
              <X onClick={() => setShowSettings(false)} className="absolute top-4 right-4 cursor-pointer text-zinc-500" />
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-[#10A5F5]" /> Settings</h2>
              <div className="space-y-4 text-white">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 text-sm">{performanceMode ? <ZapOff className="w-4 h-4 text-yellow-500" /> : <Zap className="w-4 h-4 text-yellow-500" />} Performance Mode</div>
                  <button onClick={() => setPerformanceMode(!performanceMode)} className={`w-10 h-5 rounded-full relative transition-colors ${performanceMode ? 'bg-[#10A5F5]' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${performanceMode ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <button onClick={() => { if(confirm('Clear all playtime data?')) setPlaytimes({}); }} className="w-full flex items-center justify-between p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 text-red-500 text-sm transition-colors">Clear Playtime Data <Trash2 className="w-4 h-4" /></button>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"><span className="text-sm">Panic Key Enabled</span><button onClick={() => setPanicEnabled(!panicEnabled)} className={`w-10 h-5 rounded-full relative ${panicEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${panicEnabled ? 'left-6' : 'left-1'}`} /></button></div>
                {panicEnabled && (<><input type="text" value={panicUrl} onChange={(e) => {setPanicUrl(e.target.value); localStorage.setItem('panic-url', e.target.value);}} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm outline-none" /><button onClick={() => setIsRecording(true)} className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-sm">{isRecording ? 'Press a key...' : `Key: ${panicKey}`}</button></>)}
                <div className="space-y-2 pt-2 border-t border-white/10"><label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Custom URL Cloak</label><div className="flex gap-2"><input type="text" placeholder="e.g. wikipedia.org" value={customCloakUrl} onChange={(e) => setCustomCloakUrl(e.target.value)} className="flex-1 bg-zinc-900 border border-white/10 rounded-xl p-2 text-xs outline-none focus:border-[#10A5F5]" /><button onClick={() => { applyCloak(customCloakUrl); localStorage.setItem('custom-cloak-url', customCloakUrl); }} className="px-3 bg-[#10A5F5] text-black font-bold rounded-xl text-xs hover:bg-[#0d8bc0]">Apply</button></div></div>
                <select onChange={(e) => { const p = presets[e.target.value]; if(p){ document.title=p.title; let l=document.querySelector("link[rel*='icon']"); if(!l){l=document.createElement('link');l.rel='icon';document.head.appendChild(l);} l.href=p.favicon; } }} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm outline-none text-white"><option value="none">Presets (Default Title)</option><option value="powerschool">PowerSchool</option><option value="google">Google Drive</option></select>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {favs.length > 0 && (<section><div className="flex items-center gap-2 mb-6"><Heart className="w-5 h-5 text-[#10A5F5] fill-[#10A5F5]" /><h2 className="text-lg font-bold">Favorites</h2></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><AnimatePresence mode={performanceMode ? undefined : "popLayout"}>{favs.map(g => <GameCard key={g.id} game={g} />)}</AnimatePresence></div></section>)}
        <section>{favs.length > 0 && <div className="flex items-center gap-2 mb-6 text-zinc-500"><Gamepad2 className="w-5 h-5" /><h2 className="text-lg font-bold">All Games</h2></div>}<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><AnimatePresence mode={performanceMode ? undefined : "popLayout"}>{others.map(g => <GameCard key={g.id} game={g} />)}</AnimatePresence></div></section>
      </main>
    </div>
  );
}

export default App;
