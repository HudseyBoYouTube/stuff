import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  ArrowUp, Star, Trash2, Clock, Palette, EyeOff, Eye, 
  Trophy, LayoutGrid, ChevronRight, History, Keyboard, Dices, 
  SearchX, RotateCcw, Sparkles, ThumbsUp, ThumbsDown, Heart, AlertTriangle
} from 'lucide-react';

import gamesDataRaw from './games.json';

// --- HELPER: FUZZY SEARCH ---
const getEditDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
    }
  }
  return matrix[b.length][a.length];
};

function App() {
  // --- DATA LOADING SAFETY NET ---
  const [dataError, setDataError] = useState(false);
  const gamesData = useMemo(() => {
    try {
      if (!gamesDataRaw || !Array.isArray(gamesDataRaw)) return [];
      return gamesDataRaw;
    } catch (e) {
      setDataError(true);
      return [];
    }
  }, []);

  const originalFavicon = useMemo(() => {
    const link = document.querySelector("link[rel~='icon']");
    return link ? link.href : '/vite.svg';
  }, []);

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [view, setView] = useState('grid'); 
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const [theme, setTheme] = useState(() => localStorage.getItem('capy-theme') || '#10A5F5');
  const [stealthMode, setStealthMode] = useState(() => localStorage.getItem('capy-stealth') === 'true');
  const [panicUrl, setPanicUrl] = useState(localStorage.getItem('panic-url') || 'https://classroom.google.com');
  const [panicKey, setPanicKey] = useState(localStorage.getItem('panic-key') || 'Escape');
  const [panicEnabled, setPanicEnabled] = useState(() => localStorage.getItem('panic-enabled') !== 'false');
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('capy-favorites') || '[]'));
  const [playStats, setPlayStats] = useState(() => JSON.parse(localStorage.getItem('capy-stats') || '{}'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('capy-history') || '[]'));
  const [ratings, setRatings] = useState(() => JSON.parse(localStorage.getItem('capy-ratings') || '{}'));

  // --- LOGIC: STEALTH & REDIRECT ---
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (panicEnabled && e.key === panicKey) window.location.href = panicUrl.startsWith('http') ? panicUrl : `https://${panicUrl}`;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicKey, panicUrl, panicEnabled]);

  // --- ACTIONS ---
  const launchGame = (game) => {
    if (!game || !game.url) return;
    const newHistory = [game.id, ...history.filter(id => id !== game.id)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('capy-history', JSON.stringify(newHistory));

    const startTime = Date.now();
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
      const iframe = win.document.createElement('iframe');
      iframe.src = game.url;
      iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
      iframe.allow = "fullscreen";
      win.document.body.appendChild(iframe);
      
      // Tracking play time
      win.onbeforeunload = () => {
        const endTime = Date.now();
        const minutes = Math.floor((endTime - startTime) / 60000);
        const statsUpdate = JSON.parse(localStorage.getItem('capy-stats') || '{}');
        if (!statsUpdate[game.id]) statsUpdate[game.id] = { clicks: 0, time: 0 };
        statsUpdate[game.id].time += (minutes || 1);
        statsUpdate[game.id].clicks += 1;
        localStorage.setItem('capy-stats', JSON.stringify(statsUpdate));
        setPlayStats(statsUpdate);
      };
    }
  };

  const handleRate = (gameId, type) => {
    const newRatings = { ...ratings };
    if (newRatings[gameId] === type) delete newRatings[gameId];
    else newRatings[gameId] = type;
    setRatings(newRatings);
    localStorage.setItem('capy-ratings', JSON.stringify(newRatings));
  };

  const launchRandom = () => {
    const randomGame = gamesData[Math.floor(Math.random() * gamesData.length)];
    if (randomGame) launchGame(randomGame);
  };

  // --- COMPUTED DATA ---
  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return gamesData.filter(g => {
      const matchesSearch = g?.title?.toLowerCase().includes(q);
      let matchesCategory = true;
      if (activeCategory === 'Favorites') matchesCategory = favorites.includes(g.id);
      else if (activeCategory === 'Most Voted') matchesCategory = ratings[g.id] === 'up';
      else if (activeCategory !== 'All') matchesCategory = g?.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, gamesData, favorites, ratings]);

  const leaderboard = useMemo(() => {
    return [...gamesData]
      .filter(g => playStats[g.id]?.time > 0 || ratings[g.id])
      .sort((a, b) => {
        const scoreA = (playStats[a.id]?.time || 0) + (ratings[a.id] === 'up' ? 50 : ratings[a.id] === 'down' ? -50 : 0);
        const scoreB = (playStats[b.id]?.time || 0) + (ratings[b.id] === 'up' ? 50 : ratings[b.id] === 'down' ? -50 : 0);
        return scoreB - scoreA;
      }).slice(0, 10);
  }, [gamesData, playStats, ratings]);

  const suggestion = useMemo(() => {
    if (searchQuery.length < 2 || filteredGames.length > 0) return null;
    const q = searchQuery.toLowerCase();
    let bestMatch = null;
    let minDist = 4;
    gamesData.forEach(game => {
      const d = getEditDistance(q, game.title.toLowerCase());
      if (d < minDist) { minDist = d; bestMatch = game.title; }
    });
    return bestMatch;
  }, [searchQuery, filteredGames, gamesData]);

  const categoriesWithCounts = useMemo(() => {
    const uniqueCats = [...new Set(gamesData.map(g => g?.category).filter(Boolean))];
    const base = uniqueCats.map(cat => ({ name: cat, count: gamesData.filter(g => g.category === cat).length }));
    const final = [{ name: 'All', count: gamesData.length }, ...base];
    const upVotedCount = Object.values(ratings).filter(v => v === 'up').length;
    if (upVotedCount > 0) final.unshift({ name: 'Most Voted', count: upVotedCount });
    if (favorites.length > 0) final.unshift({ name: 'Favorites', count: favorites.length });
    return final;
  }, [gamesData, favorites, ratings]);

  // --- RENDER ERROR STATE ---
  if (dataError || gamesData.length === 0) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-black">Data Error</h1>
        <p className="text-zinc-500 max-w-md mt-2">
          The app couldn't load <b>games.json</b>.
        </p>
        <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-white/10 rounded-full font-bold hover:bg-white/20 transition-all">Retry Load</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased" style={{ '--theme': theme }}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-md h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('grid'); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
            <div className="w-8 h-8 bg-[var(--theme)] rounded-lg flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-black hidden md:block tracking-tighter">Capybara <span className="text-[var(--theme)]">Science</span></span>
          </div>

          <div className="relative w-full max-w-sm mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs outline-none focus:border-[var(--theme)]/50 text-center" />
          </div>

          <div className="flex items-center justify-end gap-2">
             <button onClick={launchRandom} className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-[var(--theme)] hover:text-black transition-all"><Dices className="w-5 h-5" /></button>
             <button onClick={() => setView(view === 'grid' ? 'leaderboard' : 'grid')} className={`p-2 border rounded-full transition-all ${view === 'leaderboard' ? 'bg-[var(--theme)] text-black' : 'bg-white/5 border-white/10'}`}><Trophy className="w-5 h-5" /></button>
             <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-500 hover:text-[var(--theme)]"><Settings className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      {view === 'grid' ? (
        <>
          {/* CATEGORIES */}
          <div className="sticky top-16 z-40 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto py-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {categoriesWithCounts.map(cat => (
                  <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border shrink-0 transition-all ${activeCategory === cat.name ? 'bg-[var(--theme)] border-[var(--theme)] text-black' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
                    {cat.name} <span className="opacity-50 ml-1">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GRID */}
          <main className="max-w-7xl mx-auto px-4 mt-8">
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredGames.map(game => (
                  <GameCard key={game.id} game={game} isFav={favorites.includes(game.id)} rating={ratings[game.id]} stats={playStats[game.id]} onLaunch={launchGame} onFav={setFavorites} onRate={handleRate} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <SearchX className="w-12 h-12 text-zinc-800 mb-4" />
                <p className="text-zinc-500">No games found.</p>
                {suggestion && <button onClick={() => setSearchQuery(suggestion)} className="mt-2 text-[var(--theme)] font-bold italic underline">Did you mean {suggestion}?</button>}
              </div>
            )}
          </main>
        </>
      ) : (
        /* LEADERBOARD VIEW */
        <main className="max-w-3xl mx-auto px-4 mt-12">
          <h1 className="text-3xl font-black mb-8 flex items-center gap-3">Hall of Fame</h1>
          <div className="space-y-3">
            {leaderboard.map((game, i) => (
              <div key={`rank-${game.id}`} onClick={() => launchGame(game)} className="group bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-[var(--theme)] transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-zinc-300 text-black' : i === 2 ? 'bg-orange-600 text-black' : 'bg-zinc-800 text-zinc-500'}`}>{i + 1}</div>
                <img src={game.thumbnail} className="w-12 h-12 rounded-lg object-cover" alt="" />
                <div className="flex-1">
                  <h3 className="font-bold text-sm group-hover:text-[var(--theme)]">{game.title}</h3>
                  <div className="flex gap-2 items-center">
                    <p className="text-[9px] text-zinc-600 uppercase font-black">{game.category}</p>
                    {ratings[game.id] === 'up' && <ThumbsUp className="w-3 h-3 text-[var(--theme)]" />}
                  </div>
                </div>
                <div className="text-right text-[10px] font-black text-zinc-500 uppercase">
                  <div className="flex items-center gap-1 justify-end text-zinc-200"><Clock className="w-3 h-3 text-[var(--theme)]" /> {playStats[game.id]?.time || 0}m</div>
                  <div>Score: {(playStats[game.id]?.time || 0) + (ratings[game.id] === 'up' ? 50 : -50)}</div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowSettings(false)} />
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative z-10 shadow-2xl">
            <X onClick={() => setShowSettings(false)} className="absolute top-4 right-4 cursor-pointer text-zinc-500" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-[var(--theme)]" /> System Config</h2>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="text-sm flex items-center gap-2">{stealthMode ? <EyeOff className="w-4 h-4 text-[var(--theme)]" /> : <Eye className="w-4 h-4" />} Tab Disguise</div>
                  <button onClick={() => setStealthMode(!stealthMode)} className={`w-10 h-5 rounded-full relative transition-colors ${stealthMode ? 'bg-[var(--theme)]' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${stealthMode ? 'left-6' : 'left-1'}`} />
                  </button>
               </div>

               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm flex items-center gap-2 font-bold"><Keyboard className="w-4 h-4 text-red-500" /> Panic Key</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" maxLength="1" value={panicKey} onChange={(e) => {setPanicKey(e.target.value); localStorage.setItem('panic-key', e.target.value);}} className="bg-black/40 p-2 rounded-xl border border-white/5 text-xs outline-none text-center uppercase" />
                    <input type="text" value={panicUrl} onChange={(e) => {setPanicUrl(e.target.value); localStorage.setItem('panic-url', e.target.value);}} className="bg-black/40 p-2 rounded-xl border border-white/5 text-xs outline-none" />
                  </div>
               </div>

               <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-sm mb-3 font-bold flex items-center gap-2"><Palette className="w-4 h-4" /> Theme Color</div>
                  <div className="flex gap-3">
                    {['#10A5F5', '#10f57b', '#f5107b', '#f5a610'].map(c => (
                      <button key={c} onClick={() => {setTheme(c); localStorage.setItem('capy-theme', c);}} className={`w-8 h-8 rounded-full border-2 transition-all ${theme === c ? 'border-white scale-110' : 'border-transparent'}`} style={{background: c}} />
                    ))}
                  </div>
               </div>

               <button onClick={() => { if(confirmClear) { localStorage.clear(); window.location.reload(); } else setConfirmClear(true); }} className={`w-full p-4 rounded-2xl border text-xs font-bold transition-all ${confirmClear ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
                 <Trash2 className="w-4 h-4 inline mr-2" /> {confirmClear ? "Wipe Local Data?" : "Clear App Cache"}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GameCard({ game, isFav, rating, stats, onLaunch, onFav, onRate }) {
  const isUtility = ['request', 'report'].includes(game.id);
  return (
    <div className="group bg-zinc-900/40 rounded-[2rem] overflow-hidden border border-white/5 hover:border-[var(--theme)]/30 transition-all flex flex-col cursor-pointer" onClick={() => onLaunch(game)}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={game.thumbnail} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
        
        {!isUtility && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <button onClick={(e) => { e.stopPropagation(); 
              const saved = JSON.parse(localStorage.getItem('capy-favorites') || '[]');
              const next = saved.includes(game.id) ? saved.filter(id => id !== game.id) : [...saved, game.id];
              localStorage.setItem('capy-favorites', JSON.stringify(next));
              onFav(next);
            }} className={`p-2 rounded-xl backdrop-blur-md transition-all ${isFav ? 'bg-[var(--theme)] text-black' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'}`}>
              <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-10 h-10 text-[var(--theme)] fill-current" />
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-bold text-sm truncate group-hover:text-[var(--theme)]">{game.title}</h3>
          {!isUtility && stats?.time > 0 && <span className="text-[9px] font-black text-zinc-500 bg-white/5 px-2 py-0.5 rounded-md">{stats.time}m</span>}
        </div>
        <p className="text-[9px] text-zinc-600 uppercase font-black">{game.category}</p>
        {!isUtility && (
          <div className="flex gap-2 mt-3">
            <button onClick={(e) => { e.stopPropagation(); onRate(game.id, 'up'); }} className={`p-1.5 rounded-md transition-all ${rating === 'up' ? 'bg-[var(--theme)]/20 text-[var(--theme)]' : 'text-zinc-600 hover:text-white'}`}><ThumbsUp className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); onRate(game.id, 'down'); }} className={`p-1.5 rounded-md transition-all ${rating === 'down' ? 'bg-red-500/20 text-red-500' : 'text-zinc-600 hover:text-white'}`}><ThumbsDown className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
