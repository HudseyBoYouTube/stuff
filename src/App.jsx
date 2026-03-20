import { useState, useMemo, useEffect } from 'react';
import { Search, Gamepad2, Play, Settings, X, ShieldAlert, Heart, Sun, Moon, Zap, ZapOff, Filter, Clock, Trash2, Dices, Battery, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull, Calendar, Image as ImageIcon } from 'lucide-react';
import gamesData from './games.json';

function App() {
  // Safe State Initialization
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const [performanceMode, setPerformanceMode] = useState(() => localStorage.getItem('perf-mode') === 'true');
  const [panicUrl, setPanicUrl] = useState(localStorage.getItem('panic-url') || 'https://classroom.google.com');
  const [panicKey, setPanicKey] = useState(localStorage.getItem('panic-key') || 'Escape');
  const [panicEnabled, setPanicEnabled] = useState(localStorage.getItem('panic-enabled') !== 'false');
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('theme') === 'light');
  const [customCloakUrl, setCustomCloakUrl] = useState(localStorage.getItem('custom-cloak-url') || '');
  const [customIconUrl, setCustomIconUrl] = useState(localStorage.getItem('custom-icon-url') || '');
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [battery, setBattery] = useState({ level: 100, charging: false });

  const [playtimes, setPlaytimes] = useState(() => {
    try {
      const saved = localStorage.getItem('game-playtimes');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorite-games');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // 1. SAFE ICON UPDATE
  const updateIcon = (url) => {
    if (!url) return;
    try {
      let l = document.querySelector("link[rel*='icon']");
      if (!l) {
        l = document.createElement('link');
        l.rel = 'icon';
        document.head.appendChild(l);
      }
      l.href = url;
    } catch (e) { console.error("Icon update failed", e); }
  };

  // 2. SAFE CLOAK APPLY
  const applyCloak = (url) => {
    if (!url) return;
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      const rawName = domain.replace('www.', '').split('.')[0]; 
      const formattedTitle = rawName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      document.title = formattedTitle;
      const icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      updateIcon(icon);
      localStorage.setItem('cloaked-title', formattedTitle);
      localStorage.setItem('custom-icon-url', icon);
    } catch (e) { 
      document.title = 'Capybara Science'; 
    }
  };

  // 3. RECOVERY EFFECT (Fixes the blank screen issue)
  useEffect(() => {
    try {
      const savedTitle = localStorage.getItem('cloaked-title');
      const savedIcon = localStorage.getItem('custom-icon-url');
      if (savedTitle) document.title = savedTitle;
      if (savedIcon) updateIcon(savedIcon);
    } catch (e) {
      console.warn("Storage recovery failed, resetting to defaults.");
      document.title = 'Capybara Science';
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLightMode);
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isRecording) {
        setPanicKey(e.key);
        localStorage.setItem('panic-key', e.key);
        setIsRecording(false);
        return;
      }
      if (panicEnabled && e.key === panicKey) {
        window.location.href = panicUrl;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicEnabled, panicKey, panicUrl, isRecording]);

  const categories = useMemo(() => {
    const cats = (gamesData || []).map(g => g.category);
    return ['All', ...new Set(cats.filter(Boolean))];
  }, []);

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (gamesData || []).filter(g => {
      const matchesSearch = g.title?.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || g.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleSelectGame = (game) => {
    const win = window.open('about:blank', '_blank');
    if (!win) return;
    win.document.title = 'Loading...';
    const doc = win.document;
    doc.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
    const iframe = doc.createElement('iframe');
    iframe.src = game.url;
    iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
    iframe.allow = "fullscreen";
    doc.body.appendChild(iframe);
  };

  const GameCard = ({ game }) => (
    <div className="group bg-zinc-800/40 border border-white/5 rounded-2xl overflow-hidden cursor-pointer flex flex-col" onClick={() => handleSelectGame(game)}>
      <div className="relative aspect-[4/3] bg-zinc-800/20 overflow-hidden shrink-0">
        <img src={game.thumbnail} alt={game.title} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-10 h-10 text-white fill-current" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white truncate text-sm">{game.title}</h3>
        <p className="text-[10px] text-zinc-500 uppercase mt-1">{game.category}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 selection:bg-[#10A5F5]/30">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10A5F5] rounded-lg flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-bold tracking-tight">Capybara <span className="text-[#10A5F5]">Science</span></span>
          </div>
          
          <div className="flex-1 max-w-md mx-8 relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search games..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-[#10A5F5]/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsLightMode(!isLightMode)} className="p-2 text-zinc-400 hover:text-white transition-colors">{isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}</button>
            <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-400 hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center p-4 z-[100] bg-black/90" onClick={() => setShowSettings(false)}>
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <X onClick={() => setShowSettings(false)} className="absolute top-4 right-4 cursor-pointer text-zinc-500 hover:text-white" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><ShieldAlert className="w-5 h-5 text-[#10A5F5]" /> Settings</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Emergency URL</label>
                <input type="text" value={panicUrl} onChange={(e) => {setPanicUrl(e.target.value); localStorage.setItem('panic-url', e.target.value);}} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#10A5F5]" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Tab Cloaking (Domain)</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. drive.google.com" value={customCloakUrl} onChange={(e) => setCustomCloakUrl(e.target.value)} className="flex-1 bg-zinc-800 border border-white/10 rounded-xl p-2 text-sm text-white outline-none" />
                  <button onClick={() => applyCloak(customCloakUrl)} className="px-4 bg-[#10A5F5] text-black font-bold rounded-xl text-xs">Apply</button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={() => { if(confirm('Reset everything? This fixes blank screens.')) { localStorage.clear(); window.location.reload(); }}} 
                  className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 text-red-500 text-xs transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Reset Factory Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-[#10A5F5] border-[#10A5F5] text-black' : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredGames.map(game => <GameCard key={game.id} game={game} />)}
        </div>
      </main>
    </div>
  );
}

export default App;
