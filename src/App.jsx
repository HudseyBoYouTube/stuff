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

  // Keep the clock updated
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Battery API
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(bat => {
        const update = () => setBattery({ level: Math.round(bat.level * 100), charging: bat.charging });
        update();
        bat.addEventListener('levelchange', update);
        bat.addEventListener('chargingchange', update);
      });
    }
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
    const doc = win.document;
    doc.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
    const iframe = doc.createElement('iframe');
    iframe.src = game.url;
    iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
    iframe.allow = "fullscreen";
    doc.body.appendChild(iframe);
  };

  const BatteryIcon = () => {
    if (battery.charging) return <BatteryCharging className="w-4 h-4 text-emerald-500" />;
    if (battery.level > 80) return <BatteryFull className="w-4 h-4 text-[#10A5F5]" />;
    if (battery.level > 30) return <BatteryMedium className="w-4 h-4 text-zinc-400" />;
    return <BatteryLow className="w-4 h-4 text-red-500 animate-pulse" />;
  };

  const GameCard = ({ game }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden cursor-pointer flex flex-col shadow-lg" 
      onClick={() => handleSelectGame(game)}
    >
      <div className="relative aspect-[4/3] bg-zinc-800/20 overflow-hidden">
        <img src={game.thumbnail} alt={game.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-[#10A5F5] rounded-full flex items-center justify-center shadow-xl">
            <Play className="w-6 h-6 text-black fill-current" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-white truncate text-sm">{game.title}</h3>
          <span className="text-[9px] font-extrabold uppercase text-[#10A5F5] px-2 py-0.5 bg-[#10A5F5]/10 rounded-md border border-[#10A5F5]/20">{game.category}</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-md h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10A5F5] rounded-lg flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-black hidden sm:block">Capybara <span className="text-[#10A5F5]">Science</span></span>
          </div>

          <div className="relative w-full max-w-md justify-self-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search games..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-[#10A5F5]/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-4 justify-self-end">
             <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/5 rounded-full">
              <div className="flex items-center gap-1.5 border-r border-white/10 pr-3"><BatteryIcon /><span className="text-[11px] font-bold text-zinc-400">{battery.level}%</span></div>
              <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#10A5F5]" /><span className="text-[11px] font-bold text-zinc-200">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
            </div>
            <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-400 hover:text-[#10A5F5] transition-colors"><Settings className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-sm w-full relative shadow-2xl z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <X onClick={() => setShowSettings(false)} className="absolute top-4 right-4 cursor-pointer text-zinc-500 hover:text-white" />
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-[#10A5F5]" /> Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 text-sm">Panic Key Enabled</div>
                  <button onClick={() => setPanicEnabled(!panicEnabled)} className={`w-10 h-5 rounded-full relative transition-colors ${panicEnabled ? 'bg-[#10A5F5]' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${panicEnabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <input type="text" value={panicUrl} onChange={(e) => setPanicUrl(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#10A5F5]" placeholder="Panic URL" />
                  <button onClick={() => setIsRecording(true)} className={`w-full p-3 rounded-xl border border-white/10 text-sm ${isRecording ? 'bg-[#10A5F5] text-black font-bold' : 'bg-white/5 text-zinc-400'}`}>{isRecording ? 'Press any key...' : `Panic Key: ${panicKey}`}</button>
                </div>

                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-colors">Emergency Factory Reset</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-8 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${activeCategory === cat ? 'bg-[#10A5F5] border-[#10A5F5] text-black shadow-lg shadow-[#10A5F5]/20' : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredGames.map(game => <GameCard key={game.id} game={game} />)}
        </div>
      </main>
    </div>
  );
}

export default App;
