import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  ArrowUp, Star, Trash2, Clock, Palette, EyeOff, Eye, 
  Trophy, LayoutGrid, ChevronRight, History, Keyboard, Dices
} from 'lucide-react';
import gamesDataRaw from './games.json';

function App() {
  // --- DATA & STATE ---
  const gamesData = useMemo(() => {
    try { return Array.isArray(gamesDataRaw) ? gamesDataRaw : []; } 
    catch (e) { return []; }
  }, []);

  const originalFavicon = useMemo(() => {
    const link = document.querySelector("link[rel~='icon']");
    return link ? link.href : '/vite.svg';
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [view, setView] = useState('grid'); 
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // --- PERSISTENT STATES ---
  const [theme, setTheme] = useState(() => localStorage.getItem('capy-theme') || '#10A5F5');
  const [stealthMode, setStealthMode] = useState(() => localStorage.getItem('capy-stealth') === 'true');
  const [panicUrl, setPanicUrl] = useState(localStorage.getItem('panic-url') || 'https://classroom.google.com');
  const [panicKey, setPanicKey] = useState(localStorage.getItem('panic-key') || 'Escape');
  const [panicEnabled, setPanicEnabled] = useState(() => localStorage.getItem('panic-enabled') !== 'false');
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('capy-favorites') || '[]'));
  const [playStats, setPlayStats] = useState(() => JSON.parse(localStorage.getItem('capy-stats') || '{}'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('capy-history') || '[]'));

  // --- LOGIC: STEALTH MODE ---
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (stealthMode) {
      document.title = "My Drive - Google Drive";
      if (link) link.href = "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png";
    } else {
      document.title = "Capybara Science";
      if (link) link.href = originalFavicon;
    }
    localStorage.setItem('capy-stealth', stealthMode);
  }, [stealthMode, originalFavicon]);

  // --- LOGIC: GAME LAUNCHER ---
  const launchGame = (game) => {
    if (!game || !game.url) return;
    const newHistory = [game.id, ...history.filter(id => id !== game.id)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('capy-history', JSON.stringify(newHistory));

    const startTime = Date.now();
    const newStats = { ...playStats };
    if (!newStats[game.id]) newStats[game.id] = { clicks: 0, time: 0 };
    newStats[game.id].clicks += 1;
    setPlayStats(newStats);
    localStorage.setItem('capy-stats', JSON.stringify(newStats));

    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.title = "DO NOT REFRESH";
      win.onbeforeunload = () => {
        const endTime = Date.now();
        const minutes = Math.floor((endTime - startTime) / 60000);
        const statsUpdate = JSON.parse(localStorage.getItem('capy-stats') || '{}');
        if (statsUpdate[game.id]) statsUpdate[game.id].time += (minutes || 1);
        localStorage.setItem('capy-stats', JSON.stringify(statsUpdate));
        setPlayStats(statsUpdate);
      };
      const script = win.document.createElement('script');
      script.textContent = `document.title = "DO NOT REFRESH"; setInterval(() => { if (document.title !== "DO NOT REFRESH") document.title = "DO NOT REFRESH"; }, 100);`;
      win.document.head.appendChild(script);
      win.document.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
      const iframe = win.document.createElement('iframe');
      iframe.src = game.url;
      iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
      iframe.allow = "fullscreen";
      win.document.body.appendChild(iframe);
    }
  };

  const launchRandom = () => {
    if (gamesData.length === 0) return;
    const randomIdx = Math.floor(Math.random() * gamesData.length);
    launchGame(gamesData[randomIdx]);
  };

  // --- COMPUTED DATA ---
  const recentGames = useMemo(() => {
    return history.map(id => gamesData.find(g => g.id === id)).filter(Boolean);
  }, [history, gamesData]);

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return gamesData.filter(g => {
      const matchesSearch = g?.title?.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'Favorites' ? favorites.includes(g.id) : (activeCategory === 'All' || g?.category === activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, gamesData, favorites]);

  const categoriesWithCounts = useMemo(() => {
    const cats = gamesData.map(g => g?.category).filter(Boolean);
    const uniqueCats = [...new Set(cats)];
    const base = uniqueCats.map(cat => ({
      name: cat,
      count: gamesData.filter(g => g.category === cat).length
    }));
    const final = [{ name: 'All', count: gamesData.length }, ...base];
    if (favorites.length > 0) final.unshift({ name: 'Favorites', count: favorites.length });
    return final;
  }, [gamesData, favorites]);

  const leaderboard = useMemo(() => {
    return [...gamesData]
      .filter(g => playStats[g.id]?.time > 0)
      .sort((a, b) => (playStats[b.id]?.time || 0) - (playStats[a.id]?.time || 0))
      .slice(0, 10);
  }, [gamesData, playStats]);

  // --- EFFECTS ---
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (panicEnabled && e.key === panicKey) window.location.href = panicUrl.startsWith('http') ? panicUrl : `https://${panicUrl}`;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicKey, panicUrl, panicEnabled]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased" style={{ '--theme': theme }}>
      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 z-[60] p-4 bg-[var(--theme)] text-black rounded-2xl shadow-2xl hover:scale-110 transition-all">
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowSettings(false)} />
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative z-10 shadow-2xl">
            <X onClick={() => setShowSettings(false)} className="absolute top-4 right-4 cursor-pointer text-zinc-500 hover:text-white" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-[var(--theme)]" /> Settings</h2>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="text-sm flex items-center gap-2">{stealthMode ? <EyeOff className="w-4 h-4 text-[var(--theme)]" /> : <Eye className="w-4 h-4" />} Tab Disguise</div>
                  <button onClick={() => setStealthMode(!stealthMode)} className={`w-10 h-5 rounded-full relative transition-colors ${stealthMode ? 'bg-[var(--theme)]' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${stealthMode ? 'left-6' : 'left-1'}`} />
                  </button>
               </div>

               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm flex items-center gap-2 font-bold"><Keyboard className="w-4 h-4 text-red-500" /> Panic Button</div>
                    <button onClick={() => {setPanicEnabled(!panicEnabled); localStorage.setItem('panic-enabled', !panicEnabled);}} className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${panicEnabled ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-500'}`}>
                      {panicEnabled ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-black">Trigger Key</label>
                      <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
                        <kbd className="min-w-[24px] h-6 flex items-center justify-center bg-zinc-800 border-b-2 border-zinc-950 rounded text-[10px] font-mono text-[var(--theme)] px-1 uppercase">{panicKey === 'Escape' ? 'Esc' : panicKey}</kbd>
                        <input type="text" maxLength="1" value={panicKey} onChange={(e) => {setPanicKey(e.target.value); localStorage.setItem('panic-key', e.target.value);}} className="w-full bg-transparent text-xs outline-none uppercase text-center" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-black">Redirect URL</label>
                      <input type="text" value={panicUrl} onChange={(e) => {setPanicUrl(e.target.value); localStorage.setItem('panic-url', e.target.value);}} className="w-full bg-black/40 p-2 rounded-xl border border-white/5 text-xs outline-none focus:border-[var(--theme)]/30" />
                    </div>
                  </div>
               </div>

               <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-sm mb-3 flex items-center gap-2 font-bold"><Palette className="w-4 h-4" /> Theme Color</div>
                  <div className="flex gap-3">
                    {['#10A5F5', '#10f57b', '#f5107b', '#f5a610'].map(c => (
                      <button key={c} onClick={() => {setTheme(c); localStorage.setItem('capy-theme', c);}} className={`w-8 h-8 rounded-full border-2 transition-all ${theme === c ? 'border-white scale-110' : 'border-transparent'}`} style={{background: c}} />
                    ))}
                  </div>
               </div>

               <button onClick={() => { if(confirmClear) { localStorage.clear(); window.location.reload(); } else setConfirmClear(true); }} className={`w-full p-4 rounded-2xl border text-sm font-bold transition-all ${confirmClear ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-zinc-400'}`}>
                 <Trash2 className="w-4 h-4 inline mr-2" /> {confirmClear ? "Wipe EVERYTHING?" : "Reset All Site Data"}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-md h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('grid'); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
            <div className="w-8 h-8 bg-[var(--theme)] rounded-lg flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-black hidden md:block">Capybara <span className="text-[var(--theme)]">Science</span></span>
          </div>

          <div className="relative w-full max-w-sm mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="text" placeholder="Search games..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--theme)]/50 text-center" />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button onClick={launchRandom} className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-[var(--theme)] hover:text-black transition-all group" title="Random Game">
              <Dices className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
            <button onClick={() => setView(view === 'grid' ? 'leaderboard' : 'grid')} className={`p-2.5 border rounded-full transition-all ${view === 'leaderboard' ? 'bg-[var(--theme)] text-black border-[var(--theme)]' : 'bg-white/5 border-white/10 hover:border-[var(--theme)] hover:text-[var(--theme)]'}`} title="Leaderboard">
              <Trophy className="w-5 h-5" />
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-400 hover:text-[var(--theme)] ml-1"><Settings className="w-6 h-6" /></button>
          </div>

        </div>
      </header>

      {view === 'grid' ? (
        <>
          <div className="sticky top-16 z-40 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto pt-3 space-y-3">
              {recentGames.length > 0 && (
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                  <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1 shrink-0"><History className="w-3 h-3" /> Recent</div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {recentGames.map(game => (
                      <button key={`hist-${game.id}`} onClick={() => launchGame(game)} className="w-8 h-8 rounded-full overflow-hidden border border-white/10 hover:border-[var(--theme)] transition-all shrink-0">
                        <img src={game.thumbnail} className="w-full h-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Category Container: pb-3 added to push scrollbar away from buttons */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3">
                {categoriesWithCounts.map(cat => (
                  <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-2 rounded-full text-xs font-bold border shrink-0 transition-all flex items-center gap-2 ${activeCategory === cat.name ? 'bg-[var(--theme)] border-[var(--theme)] text-black shadow-lg shadow-[var(--theme)]/20' : 'bg-white/5 border-white/10 text-zinc-400'}`}>
                    {cat.name}
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeCategory === cat.name ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-500'}`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredGames.map(game => (
                <GameCard key={game.id} game={game} isFav={favorites.includes(game.id)} stats={playStats[game.id]} onLaunch={launchGame} onFav={setFavorites} />
              ))}
            </div>
          </main>
        </>
      ) : (
        <main className="max-w-3xl mx-auto px-4 mt-12">
          <h1 className="text-3xl font-black mb-8 flex items-center gap-3"><Trophy className="w-8 h-8 text-yellow-500" /> Leaderboard</h1>
          <div className="space-y-3">
            {leaderboard.map((game, index) => (
              <div key={`rank-${game.id}`} onClick={() => launchGame(game)} className="group bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-[var(--theme)] transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-zinc-300 text-black' : index === 2 ? 'bg-orange-600 text-black' : 'bg-zinc-800 text-zinc-500'}`}>{index + 1}</div>
                <img src={game.thumbnail} className="w-12 h-12 rounded-lg object-cover" alt="" />
                <div className="flex-1">
                  <h3 className="font-bold text-sm group-hover:text-[var(--theme)]">{game.title}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">{game.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black flex items-center gap-1 justify-end"><Clock className="w-3 h-3 text-[var(--theme)]" /> {playStats[game.id].time}m</div>
                  <div className="text-[10px] text-zinc-500">{playStats[game.id].clicks} sessions</div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-[var(--theme)]" />
              </div>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}

function GameCard({ game, isFav, stats, onLaunch, onFav }) {
  const isUtility = ['request', 'report'].includes(game.id);
  return (
    <div className="group relative bg-zinc-900/50 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-[var(--theme)] transition-all" onClick={() => onLaunch(game)}>
      <div className="relative aspect-[4/3] bg-zinc-800/20 overflow-hidden">
        <img src={game.thumbnail} alt={game.title} className={`absolute inset-0 w-full h-full ${isUtility ? 'object-contain p-10' : 'object-cover'}`} />
        {!isUtility && (
          <button onClick={(e) => {
            e.stopPropagation();
            const saved = JSON.parse(localStorage.getItem('capy-favorites') || '[]');
            const next = saved.includes(game.id) ? saved.filter(id => id !== game.id) : [...saved, game.id];
            localStorage.setItem('capy-favorites', JSON.stringify(next));
            onFav(next);
          }} className={`absolute top-3 right-3 z-10 p-2 rounded-xl backdrop-blur-md ${isFav ? 'bg-[var(--theme)] text-black' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`}>
            <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
          <div className="w-12 h-12 bg-[var(--theme)] rounded-full flex items-center justify-center shadow-xl"><Play className="w-6 h-6 text-black fill-current" /></div>
        </div>
      </div>
      <div className="p-4 flex justify-between items-end">
        <div>
          <h3 className="font-bold text-white truncate text-sm group-hover:text-[var(--theme)] transition-colors">{game.title}</h3>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">{game.category}</p>
        </div>
        {!isUtility && stats?.time > 0 && (
          <div className="text-[10px] text-zinc-500 flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
            <Clock className="w-3 h-3" /> {stats.time}m
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
