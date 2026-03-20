import { useState, useMemo, useEffect } from 'react';
import { Search, Gamepad2, Play, Settings, X, ShieldAlert, Heart, Sun, Moon, Zap, ZapOff, Filter, Clock, Trash2, Dices, Battery, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull, Calendar, Image as ImageIcon } from 'lucide-react';
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
  const [customIconUrl, setCustomIconUrl] = useState(localStorage.getItem('custom-icon-url') || '');
  
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

  const presets = {
    none: { title: 'Capybara Science', favicon: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' },
    powerschool: { title: 'PowerSchool', favicon: 'https://www.powerschool.com/favicon.ico' },
    google: { title: 'My Drive - Google Drive', favicon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const updateIcon = (url) => {
    let l = document.querySelector("link[rel*='icon']");
    if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
    l.href = url;
    localStorage.setItem('custom-icon-url', url);
  };

  const applyCloak = (url) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      const rawName = domain.replace('www.', '').split('.')[0]; 
      const formattedTitle = rawName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      document.title = formattedTitle;
      const icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      updateIcon(icon);
      localStorage.setItem('cloaked-title', formattedTitle);
    } catch (e) { document.title = 'Capybara Science'; }
  };

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

  const GameCard = ({ game }) => {
    const isUtility = ['request', 'report'].includes(game.id);
    const timeSpent = playtimes[game.id] || 0;
    
    return (
      <div 
        className="group bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden cursor-pointer flex flex-col shadow-lg transition-transform duration-300 ease-out hover:-translate-y-1 active:scale-[0.98]"
        style={{ 
          transformStyle: 'preserve-3d', 
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }}
        onClick={() => handleSelectGame(game)}
      >
        {/* Fixed Image Container */}
        <div className="relative aspect-[4/3] bg-zinc-800/20 overflow-hidden pointer-events-none">
          <img 
            src={game.thumbnail} 
            alt={game.title} 
            className={`absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-110 ${isUtility ? 'object-contain p-6' : 'object-cover'}`}
            style={{ transform: 'translate3d(0,0,0)' }}
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 bg-[#10A5F5] rounded-full flex items-center justify-center shadow-2xl">
              <Play className="w-6 h-6 text-black fill-current" />
            </div>
          </div>
        </div>
        
        <div className="p-4 flex-1 pointer-events-none">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h3 className="font-bold text-white truncate text-sm transition-colors group-hover:text-[#10A5F5]">{game.title}</h3>
            <span className="text-[9px] font-extrabold uppercase text-[#10A5F5] px-2 py-0.5 bg-[#10A5F5]/10 rounded-md border border-[#10A5F5]/20">{game.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-zinc-500">{isUtility ? 'Click to fill out' : 'Click to play'}</p>
            {!isUtility && timeSpent > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                <Clock className="w-3 h-3" />
                {timeSpent >= 60 ? `${Math.floor(timeSpent/60)}h ${timeSpent%60}m` : `${timeSpent}m`}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 selection:bg-[#10A5F5]/30">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10A5F5] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,165,245,0.3)]"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-black hidden sm:block">Capybara <span className="text-[#10A5F5]">Science</span></span>
          </div>

          <div className="relative w-full max-w-md justify-self-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="text" placeholder="Search games..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-[#10A5F5]/50 focus:bg-white/[0.07] transition-all" />
          </div>

          <div className="flex items-center gap-4 justify-self-end">
             <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/5 rounded-full">
              <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                  {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
                {battery.charging ? <BatteryCharging className="w-4 h-4 text-emerald-500" /> : <BatteryFull className="w-4 h-4 text-[#10A5F5]" />}
                <span className="text-[11px] font-bold text-zinc-400">{battery.level}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#10A5F5]" />
                <span className="text-[11px] font-bold text-zinc-200">{currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            </div>
            <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-400 hover:text-[#10A5F5] transition-colors"><Settings className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-sm w-full relative shadow-2xl z-10 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <X onClick={() => setShowSettings(false)} className="absolute top-4 right-4 cursor-pointer text-zinc-500 hover:text-white" />
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><ShieldAlert className="w-5 h-5 text-[#10A5F5]" /> Settings</h2>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 text-sm text-white">{performanceMode ? <ZapOff className="w-4 h-4 text-yellow-500" /> : <Zap className="w-4 h-4 text-yellow-500" />} Performance Mode</div>
                  <button onClick={() => setPerformanceMode(!performanceMode)} className={`w-10 h-5 rounded-full relative transition-colors ${performanceMode ? 'bg-[#10A5F5]' : 'bg-zinc-700'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${performanceMode ? 'left-6' : 'left-1'}`} /></button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Panic Setup</label>
                  <input type="text" value={panicUrl} onChange={(e) => setPanicUrl(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#10A5F5]" placeholder="Panic URL" />
                  <button onClick={() => setIsRecording(true)} className={`w-full p-3 rounded-xl border border-white/10 text-sm ${isRecording ? 'bg-[#10A5F5] text-black font-bold' : 'bg-white/5 text-zinc-400'}`}>{isRecording ? 'Press any key...' : `Panic Key: ${panicKey}`}</button>
                </div>

                <div className="space-y-3 pt-2 border-t border-white/10">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Tab Cloaking</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="URL (e.g. google.com)" value={customCloakUrl} onChange={(e) => setCustomCloakUrl(e.target.value)} className="flex-1 bg-zinc-800 border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-[#10A5F5]" />
                    <button onClick={() => applyCloak(customCloakUrl)} className="px-3 bg-[#10A5F5] text-black font-bold rounded-xl text-xs">Apply</button>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Icon URL" value={customIconUrl} onChange={(e) => setCustomIconUrl(e.target.value)} className="flex-1 bg-zinc-800 border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-[#10A5F5]" />
                    <button onClick={() => updateIcon(customIconUrl)} className="px-3 bg-zinc-700 text-white font-bold rounded-xl text-xs"><ImageIcon className="w-3.5 h-3.5" /></button>
                  </div>
                  <select onChange={(e) => { const p = presets[e.target.value]; if(p){ document.title=p.title; updateIcon(p.favicon); }}} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-sm text-white outline-none">
                    <option value="none">Presets</option>
                    <option value="powerschool">PowerSchool</option>
                    <option value="google">Google Drive</option>
                  </select>
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
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${activeCategory === cat ? 'bg-[#10A5F5] border-[#10A5F5] text-black shadow-lg shadow-[#10A5F5]/20' : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'}`}>{cat}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredGames.map(game => <GameCard key={game.id} game={game} />)}
        </div>
      </main>
    </div>
  );
}

export default App;
