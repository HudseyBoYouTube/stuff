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
  const [theme, setTheme] = useState(() => localStorage.getItem('capy-theme') || '#10A5F5');
  const [disguise, setDisguise] = useState(() => localStorage.getItem('capy-stealth-type') || 'none');
  const [customFavicon, setCustomFavicon] = useState(() => localStorage.getItem('capy-custom-icon') || null);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('capy-favorites') || '[]'));
  
  // PLAYTIME & LEADERBOARD STATE
  const [playtimes, setPlaytimes] = useState(() => JSON.parse(localStorage.getItem('capy-playtimes') || '{}'));
  const sessionRef = useRef(null);

  const [panicKey, setPanicKey] = useState(() => localStorage.getItem('capy-panic-key') || 'p');
  const [panicUrl, setPanicUrl] = useState(() => localStorage.getItem('capy-panic-url') || 'https://google.com');

  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  // PANIC LISTENER
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === panicKey.toLowerCase()) {
        setDisguise('drive'); 
        window.location.href = panicUrl.startsWith('http') ? panicUrl : `https://${panicUrl}`;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicKey, panicUrl]);

  // SESSION TRACKER
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
        battery.addEventListener('levelchange', () => setBatteryLevel(Math.floor(battery.level * 100)));
        battery.addEventListener('chargingchange', () => setIsCharging(battery.charging));
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
      win.document.title = "DO NOT REFRESH";
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
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };

  // --- LEADERBOARD LOGIC ---
  const leaderboardGames = useMemo(() => {
    // Filter out utility cards (request/report) and only include played games
    const playable = gamesData.filter(g => !['request', 'report'].includes(g.id));
    
    // Create an array of games that have playtime, sorted by playtime descending
    const sorted = playable
      .filter(game => playtimes[game.id] && playtimes[game.id] > 60) // Must have > 1m playtime
      .sort((a, b) => (playtimes[b.id] || 0) - (playtimes[a.id] || 0))
      .slice(0, 3); // Get top 3

    return sorted;
  }, [gamesData, playtimes]);

  const launchRandom = () => {
    const playableGames = gamesData.filter(g => !['request', 'report'].includes(g.id));
    if (playableGames.length > 0) {
      const randomGame = playableGames[Math.floor(Math.random() * playableGames.length)];
      launchGame(randomGame);
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
    
    // Add dynamic categories
    if (favorites.length > 0) final.unshift({ name: 'Favorites', count: favorites.length });
    if (leaderboardGames.length > 0) final.unshift({ name: 'Leaderboard', count: leaderboardGames.length }); // Custom name

    return final;
  }, [gamesData, favorites, leaderboardGames]);

  // Determine which icon to use for the active category button
  const getCategoryIcon = (catName) => {
    if (catName === 'Favorites') return <Star className="w-3.5 h-3.5 fill-current" />;
    if (catName === 'Leaderboard') return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased" style={{ '--theme': theme }}>
      
      {/* HEADER */}
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
              {searchQuery.length > 0 && <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 cursor-pointer" onClick={() => setSearchQuery('')} />}
            </div>
            <button onClick={launchRandom} title="Random Game" className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-[var(--theme)] hover:text-black transition-all shrink-0"><Dices className="w-5 h-5" /></button>
          </div>

          <div className="flex items-center justify-end gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-zinc-400 whitespace-nowrap">
              <span>{currentTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              <span className="w-px h-3 bg-white/10" />
              <span>{currentTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
              <span className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1">
                {isCharging ? <Zap className="w-2.5 h-2.5 text-yellow-400 animate-pulse" /> : <Battery className="w-2.5 h-2.5 text-[var(--theme)]" />}
                <span>{batteryLevel}%</span>
              </div>
            </div>
             <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-500 hover:text-[var(--theme)] shrink-0"><Settings className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      {/* CATEGORIES */}
      <div className="sticky top-16 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-white/5 px-4 pt-1.5 mb-[-1rem]">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-4">
          {categoriesWithCounts.map(cat => (
            <button 
              key={cat.name} 
              onClick={() => setActiveCategory(cat.name)} 
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border shrink-0 transition-all flex items-center gap-1.5
                ${activeCategory === cat.name 
                  ? 'bg-[var(--theme)] border-[var(--theme)] text-black' 
                  : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'}`}
            >
              {getCategoryIcon(cat.name)}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* LEADERBOARD INLINE SECTION (Always display at the top if games exist) */}
        {leaderboardGames.length > 0 && activeCategory === 'All' && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-3 tracking-tight"><Trophy className="w-6 h-6 text-amber-400" /> Game Leaderboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaderboardGames.map((game, index) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  isFav={favorites.includes(game.id)} 
                  onLaunch={launchGame} 
                  onFav={setFavorites}
                  playtime={formatPlaytime(playtimes[game.id])}
                  rank={index + 1} // Pass the rank (1, 2, or 3)
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Prevent utility requests showing in dynamic categories */}
          {filteredGames.filter(g => {
             if(activeCategory === 'Favorites' || activeCategory === 'Leaderboard') return !['request', 'report'].includes(g.id);
             return true;
          }).map(game => (
            <GameCard 
              key={game.id} 
              game={game} 
              isFav={favorites.includes(game.id)} 
              onLaunch={launchGame} 
              onFav={setFavorites}
              playtime={formatPlaytime(playtimes[game.id])}
            />
          ))}
        </div>
      </main>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative z-10 shadow-2xl space-y-4 overflow-y-auto max-h-[90vh]">
            <X onClick={() => setShowSettings(false)} className="absolute top-4 right-4 cursor-pointer text-zinc-400 hover:text-red-500" />
            <h2 className="text-xl font-bold flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-[var(--theme)]" /> System Config</h2>
            
            <div className="space-y-4 pb-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <label className="text-sm block mb-2 font-bold flex items-center gap-2"><EyeOff className="w-4 h-4 text-[var(--theme)]" /> Tab Disguise</label>
                <div className="relative">
                  <select value={disguise} onChange={(e) => setDisguise(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs appearance-none focus:outline-none focus:border-[var(--theme)] cursor-pointer">
                    <option value="none">Default (Capybara Science)</option>
                    <option value="drive">Google Drive</option>
                    <option value="classroom">Google Classroom</option>
                    <option value="canvas">Canvas Dashboard</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-zinc-500" />
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <label className="text-sm block font-bold flex items-center gap-2 text-red-400"><AlertTriangle className="w-4 h-4" /> Panic Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-black mb-1 block">Trigger Key</span>
                    <input type="text" maxLength="1" value={panicKey} onChange={(e) => {setPanicKey(e.target.value); localStorage.setItem('capy-panic-key', e.target.value);}} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-center text-xs font-mono uppercase focus:border-red-500 outline-none" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-black mb-1 block">Redirect URL</span>
                    <input type="text" placeholder="google.com" value={panicUrl} onChange={(e) => {setPanicUrl(e.target.value); localStorage.setItem('capy-panic-url', e.target.value);}} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs focus:border-red-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <label className="text-sm block mb-2 font-bold flex items-center gap-2"><Palette className="w-4 h-4" /> Hex Accent</label>
                <div className="flex gap-2">
                  <input type="text" value={theme} onChange={(e) => {setTheme(e.target.value); localStorage.setItem('capy-theme', e.target.value);}} className="flex-1 bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs font-mono outline-none focus:border-[var(--theme)]" />
                  <div className="w-10 h-10 rounded-xl border border-white/10 relative shrink-0" style={{background: theme}}>
                    <input type="color" value={theme.startsWith('#') && theme.length === 7 ? theme : '#10A5F5'} onChange={(e) => {setTheme(e.target.value); localStorage.setItem('capy-theme', e.target.value);}} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>

              <button onClick={() => { if(confirm("Wipe all site data, playtimes, and favorites?")) { localStorage.clear(); window.location.reload(); } }} className="w-full p-4 rounded-2xl border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-4 h-4 inline mr-2" /> Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Updated GameCard to handle Leaderboard Ranks
function GameCard({ game, isFav, onLaunch, onFav, playtime, rank }) {
  const isUtility = ['request', 'report'].includes(game.id);
  
  // Leaderboard styling based on rank
  const getLeaderboardAccent = () => {
    if (rank === 1) return 'border-amber-400 shadow-[0_0_15px_-3px_rgba(251,191,36,0.3)]';
    if (rank === 2) return 'border-zinc-400 shadow-[0_0_15px_-3px_rgba(161,161,170,0.3)]';
    if (rank === 3) return 'border-orange-700 shadow-[0_0_15px_-3px_rgba(194,65,12,0.3)]';
    return 'border-white/5 hover:border-[var(--theme)]/30';
  };

  const getRankBadge = () => {
     if (rank === 1) return <div className="absolute top-4 left-4 z-20 bg-amber-400 text-black px-3 py-1 text-xs font-black rounded-xl">#1 Gold</div>;
     if (rank === 2) return <div className="absolute top-4 left-4 z-20 bg-zinc-400 text-black px-3 py-1 text-xs font-black rounded-xl">#2 Silver</div>;
     if (rank === 3) return <div className="absolute top-4 left-4 z-20 bg-orange-700 text-white px-3 py-1 text-xs font-black rounded-xl">#3 Bronze</div>;
     return null;
  };

  return (
    <div className={`group bg-zinc-900/40 rounded-[2rem] overflow-hidden border transition-all flex flex-col cursor-pointer ${getLeaderboardAccent()}`} onClick={() => onLaunch(game)}>
      <div className="relative aspect-[4/3] bg-black/20">
        
        {getRankBadge()} {/* Displays Gold, Silver, Bronze badging */}

        <img src={game.thumbnail} className={`absolute inset-0 m-auto transition-transform duration-500 group-hover:scale-110 ${isUtility ? 'w-24 object-contain' : 'w-full h-full object-cover'}`} alt="" />
        
        {!isUtility && (
          <button onClick={(e) => { e.stopPropagation(); const saved = JSON.parse(localStorage.getItem('capy-favorites') || '[]'); const next = saved.includes(game.id) ? saved.filter(id => id !== game.id) : [...saved, game.id]; localStorage.setItem('capy-favorites', JSON.stringify(next)); onFav(next); }} className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md z-10 ${isFav ? 'bg-[var(--theme)] text-black' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity'}`}>
            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-10 h-10 text-[var(--theme)] fill-current" /></div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-sm truncate group-hover:text-[var(--theme)] transition-colors">{game.title}</h3>
          {!isUtility && <span className="text-[8px] text-zinc-600 font-bold bg-white/5 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0"><Clock className="w-2 h-2" /> {playtime}</span>}
        </div>
        <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1">{game.category}</p>
      </div>
    </div>
  );
}

export default App;
