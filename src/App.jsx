import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  Star, Trash2, Palette, EyeOff, Eye, Clock, Trophy,
  Dices, AlertTriangle, Battery, Zap, ChevronDown, Upload, Keyboard
} from 'lucide-react';

import gamesDataRaw from './games.json';

const DISGUISE_CONFIG = {
  none: { title: "Capybara Science", icon: '/vite.svg' },
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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  
  // FIXED: Safer state initialization
  const [theme, setTheme] = useState(() => localStorage.getItem('capy-theme') || '#10A5F5');
  const [disguise, setDisguise] = useState(() => localStorage.getItem('capy-stealth-type') || 'none');
  const [customFavicon, setCustomFavicon] = useState(() => localStorage.getItem('capy-custom-icon') || null);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('capy-favorites') || '[]'));
  const [playtimes, setPlaytimes] = useState(() => JSON.parse(localStorage.getItem('capy-playtimes') || '{}'));
  
  // FIXED: Panic states with fallback to empty string
  const [panicKey, setPanicKey] = useState(() => localStorage.getItem('capy-panic-key') || '');
  const [panicUrl, setPanicUrl] = useState(() => localStorage.getItem('capy-panic-url') || 'https://google.com');

  const sessionRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (panicKey && panicKey.trim() !== "" && e.key.toLowerCase() === panicKey.toLowerCase()) {
        setDisguise('drive'); 
        window.location.href = panicUrl.startsWith('http') ? panicUrl : `https://${panicUrl}`;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicKey, panicUrl]);

  useEffect(() => {
    const handleFocus = () => {
      if (sessionRef.current) {
        const { id, start } = sessionRef.current;
        const duration = Math.floor((Date.now() - start) / 1000);
        if (duration > 5) { 
          setPlaytimes(prev => {
            const next = { ...prev, [id]: (prev[id] || 0) + duration };
            localStorage.setItem('capy-playtimes', JSON.stringify(next));
            return next;
          });
        }
        sessionRef.current = null;
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        setBatteryLevel(Math.floor(battery.level * 100));
        setIsCharging(battery.charging);
      });
    }
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateTab = () => {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      const selected = DISGUISE_CONFIG[disguise] || DISGUISE_CONFIG.none;
      document.title = selected.title;
      let newIcon = disguise === 'none' ? (customFavicon || DISGUISE_CONFIG.none.icon) : selected.icon;
      link.href = `${newIcon}?v=${new Date().getTime()}`;
    };
    updateTab();
    localStorage.setItem('capy-stealth-type', disguise);
  }, [disguise, customFavicon]);

  const launchGame = (game) => {
    if (!game?.url) return;
    sessionRef.current = { id: game.id, start: Date.now() };
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
      const iframe = win.document.createElement('iframe');
      iframe.src = game.url;
      iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
      iframe.allow = "fullscreen";
      win.document.body.appendChild(iframe);
    }
  };

  const formatPlaytime = (seconds) => {
    if (!seconds) return '0m';
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
  };

  const leaderboardGames = useMemo(() => {
    const playable = gamesData.filter(g => !['request', 'report'].includes(g.id));
    return playable
      .filter(game => playtimes[game.id] && playtimes[game.id] > 60)
      .sort((a, b) => (playtimes[b.id] || 0) - (playtimes[a.id] || 0))
      .slice(0, 3);
  }, [gamesData, playtimes]);

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return gamesData.filter(g => {
      const matchesSearch = g?.title?.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'Favorites' ? favorites.includes(g.id) : (activeCategory === 'All' || g?.category === activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, gamesData, favorites]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased" style={{ '--theme': theme }}>
      
      <header className="sticky top-0 z-50 border-b border-white/5 h-16 flex items-center px-4 bg-[#09090b]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 bg-[var(--theme)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--theme)]/20"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-black hidden lg:block tracking-tighter">Capybara <span className="text-[var(--theme)]">Science</span></span>
          </div>

          <div className="flex items-center gap-2 w-full max-sm:px-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-10 text-xs outline-none focus:border-[var(--theme)]/50 text-center" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
             <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-500 hover:text-[var(--theme)] shrink-0 transition-colors"><Settings className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6">
        {leaderboardGames.length > 0 && activeCategory === 'All' && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-3 tracking-tight"><Trophy className="w-6 h-6 text-amber-400" /> Game Leaderboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaderboardGames.map((game, index) => (
                <GameCard key={game.id} game={game} isFav={favorites.includes(game.id)} onLaunch={launchGame} onFav={setFavorites} playtime={formatPlaytime(playtimes[game.id])} rank={index + 1} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredGames.map(game => (
            <GameCard key={game.id} game={game} isFav={favorites.includes(game.id)} onLaunch={launchGame} onFav={setFavorites} playtime={formatPlaytime(playtimes[game.id])} />
          ))}
        </div>
      </main>

      {/* FIXED SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSettings(false)} />
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative z-10 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-[var(--theme)]" /> System Config</h2>
              <X onClick={() => setShowSettings(false)} className="cursor-pointer text-zinc-400 hover:text-white transition-colors" />
            </div>
            
            <div className="space-y-5">
              <section className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2"><EyeOff className="w-3 h-3" /> Tab Disguise</label>
                <select value={disguise} onChange={(e) => setDisguise(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-[var(--theme)] cursor-pointer">
                  <option value="none" className="bg-zinc-900 text-white">Default (Capybara Science)</option>
                  <option value="drive" className="bg-zinc-900 text-white">Google Drive</option>
                  <option value="classroom" className="bg-zinc-900 text-white">Google Classroom</option>
                  <option value="canvas" className="bg-zinc-900 text-white">Canvas Dashboard</option>
                </select>
              </section>

              <section className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <label className="text-[10px] uppercase font-black text-red-400 tracking-widest flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Panic Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 font-bold">Key</span>
                    <input type="text" maxLength="1" placeholder="None" value={panicKey} onChange={(e) => { setPanicKey(e.target.value); localStorage.setItem('capy-panic-key', e.target.value); }} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-center text-xs font-mono uppercase focus:border-red-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 font-bold">Redirect URL</span>
                    <input type="text" placeholder="google.com" value={panicUrl} onChange={(e) => { setPanicUrl(e.target.value); localStorage.setItem('capy-panic-url', e.target.value); }} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs focus:border-red-500 outline-none" />
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2"><Palette className="w-3 h-3" /> Accent Color</label>
                <div className="flex gap-2">
                  <input type="text" value={theme} onChange={(e) => { setTheme(e.target.value); localStorage.setItem('capy-theme', e.target.value); }} className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono outline-none focus:border-[var(--theme)]" />
                  <input type="color" value={theme.startsWith('#') && theme.length === 7 ? theme : '#10A5F5'} onChange={(e) => { setTheme(e.target.value); localStorage.setItem('capy-theme', e.target.value); }} className="w-12 h-12 rounded-xl border-none cursor-pointer bg-transparent" />
                </div>
              </section>

              <button onClick={() => { if(confirm("Are you sure? This clears ALL data.")) { localStorage.clear(); window.location.reload(); } }} className="w-full p-4 rounded-2xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-3 h-3 inline mr-2" /> Wipe Application Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GameCard({ game, isFav, onLaunch, onFav, playtime, rank }) {
  const isUtility = ['request', 'report'].includes(game.id);
  const getLeaderboardAccent = () => {
    if (rank === 1) return 'border-amber-400 shadow-[0_0_15px_-3px_rgba(251,191,36,0.3)]';
    if (rank === 2) return 'border-zinc-400 shadow-[0_0_15px_-3px_rgba(161,161,170,0.3)]';
    if (rank === 3) return 'border-orange-700 shadow-[0_0_15px_-3px_rgba(194,65,12,0.3)]';
    return 'border-white/5 hover:border-[var(--theme)]/30';
  };

  return (
    <div className={`group bg-zinc-900/40 rounded-[2rem] overflow-hidden border transition-all flex flex-col cursor-pointer ${getLeaderboardAccent()}`} onClick={() => onLaunch(game)}>
      <div className="relative aspect-[4/3] bg-black/20">
        <img src={game.thumbnail} className={`absolute inset-0 m-auto transition-transform duration-500 group-hover:scale-110 ${isUtility ? 'w-24' : 'w-full h-full object-cover'}`} alt="" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-10 h-10 text-[var(--theme)] fill-current" /></div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-sm truncate group-hover:text-[var(--theme)] transition-colors">{game.title}</h3>
          {!isUtility && <span className="text-[8px] text-zinc-600 font-bold bg-white/5 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0"><Clock className="w-2 h-2" /> {playtime}</span>}
        </div>
      </div>
    </div>
  );
}

export default App;
