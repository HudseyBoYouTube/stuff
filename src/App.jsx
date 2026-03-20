import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  ArrowUp, Star, Trash2, Clock, Palette, EyeOff, Eye, 
  Trophy, LayoutGrid, ChevronRight, History, Keyboard, Dices, 
  SearchX, RotateCcw, Sparkles, ThumbsUp, ThumbsDown, Heart
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

  // Auto-redirect if categories become empty
  useEffect(() => {
    const upVotedCount = Object.values(ratings).filter(v => v === 'up').length;
    if ((activeCategory === 'Favorites' && favorites.length === 0) || 
        (activeCategory === 'Most Voted' && upVotedCount === 0)) {
      setActiveCategory('All');
    }
  }, [favorites, ratings, activeCategory]);

  // --- LOGIC: ACTIONS ---
  const launchGame = (game) => {
    if (!game || !game.url) return;
    const newHistory = [game.id, ...history.filter(id => id !== game.id)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('capy-history', JSON.stringify(newHistory));

    const startTime = Date.now();
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.title = "DO NOT REFRESH";
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
      win.document.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
      const iframe = win.document.createElement('iframe');
      iframe.src = game.url;
      iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
      iframe.allow = "fullscreen";
      win.document.body.appendChild(iframe);
    }
  };

  const handleRate = (gameId, type) => {
    const newRatings = { ...ratings };
    if (newRatings[gameId] === type) delete newRatings[gameId];
    else newRatings[gameId] = type;
    setRatings(newRatings);
    localStorage.setItem('capy-ratings', JSON.stringify(newRatings));
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

  const leaderboard = useMemo(() => {
    return [...gamesData]
      .filter(g => playStats[g.id]?.time > 0 || ratings[g.id])
      .sort((a, b) => {
        const scoreA = (playStats[a.id]?.time || 0) + (ratings[a.id] === 'up' ? 50 : ratings[a.id] === 'down' ? -50 : 0);
        const scoreB = (playStats[b.id]?.time || 0) + (ratings[b.id] === 'up' ? 50 : ratings[b.id] === 'down' ? -50 : 0);
        return scoreB - scoreA;
      }).slice(0, 10);
  }, [gamesData, playStats, ratings]);

  const categoriesWithCounts = useMemo(() => {
    const uniqueCats = [...new Set(gamesData.map(g => g?.category).filter(Boolean))];
    const base = uniqueCats.map(cat => ({ name: cat, count: gamesData.filter(g => g.category === cat).length }));
    const final = [{ name: 'All', count: gamesData.length }, ...base];
    
    // Add Special Categories
    const upVotedCount = Object.values(ratings).filter(v => v === 'up').length;
    if (upVotedCount > 0) final.unshift({ name: 'Most Voted', count: upVotedCount });
    if (favorites.length > 0) final.unshift({ name: 'Favorites', count: favorites.length });
    
    return final;
  }, [gamesData, favorites, ratings]);

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
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 tracking-tighter"><ShieldAlert className="w-5 h-5 text-[var(--theme)]" /> System Config</h2>
            
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
                    <button onClick={() => {setPanicEnabled(!panicEnabled); localStorage.setItem('panic-enabled', !panicEnabled);}} className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${panicEnabled ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-500'}`}>
                      {panicEnabled ? 'On' : 'Off'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" maxLength="1" value={panicKey} onChange={(e) => {setPanicKey(e.target.value); localStorage.setItem('panic-key', e.target.value);}} className="bg-black/40 p-2 rounded-xl border border-white/5 text-xs outline-none text-center uppercase focus:border-[var(--theme)]/40" />
                    <input type="text" value={panicUrl} onChange={(e) => {setPanicUrl(e.target.value); localStorage.setItem('panic-url', e.target.value);}} className="bg-black/40 p-2 rounded-xl border border-white/5 text-xs outline-none focus:border-[var(--theme)]/40" />
                  </div>
               </div>

               <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-sm mb-3 flex items-center gap-2 font-bold"><Palette className="w-4 h-4" /> Branding</div>
                  <div className="flex gap-3">
                    {['#10A5F5', '#10f57b', '#f5107b', '#f5a610'].map(c => (
                      <button key={c} onClick={() => {setTheme(c); localStorage.setItem('capy-theme', c);}} className={`w-8 h-8 rounded-full border-2 transition-all ${theme === c ? 'border-white scale-110' : 'border-transparent'}`} style={{background: c}} />
                    ))}
                  </div>
               </div>

               <button onClick={() => { if(confirmClear) { localStorage.clear(); window.location.reload(); } else setConfirmClear(true); }} className={`w-full p-4 rounded-2xl border text-xs font-bold transition-all ${confirmClear ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
                 <Trash2 className="w-4 h-4 inline mr-2" /> {confirmClear ? "Are you sure?" : "Clear App Cache"}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-md h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('grid'); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
            <div className="w-8 h-8 bg-[var(--theme)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--theme)]/20"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-black hidden md:block tracking-tighter">Capybara <span className="text-[var(--theme)]">Science</span></span>
          </div>

          <div className="relative w-full max-w-sm mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input type="text" placeholder="Quick search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs outline-none focus:border-[var(--theme)]/50 text-center transition-all" />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button onClick={launchRandom} className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-[var(--theme)] hover:text-black transition-all group shadow-sm"><Dices className="w-5 h-5 group-hover:rotate-45 transition-transform" /></button>
            <button onClick={() => setView(view === 'grid' ? 'leaderboard' : 'grid')} className={`p-2.5 border rounded-full transition-all shadow-sm ${view === 'leaderboard' ? 'bg-[var(--theme)] text-black border-[var(--theme)]' : 'bg-white/5 border-white/10 hover:border-[var(--theme)]'}`}><Trophy className="w-5 h-5" /></button>
            <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-500 hover:text-[var(--theme)] ml-1 transition-colors"><Settings className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      {view === 'grid' ? (
        <>
          <div className="sticky top-16 z-40 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 px-4">
            <div className="max-w-7xl mx-auto py-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {categoriesWithCounts.map(cat => (
                  <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 transition-all flex items-center gap-2 ${activeCategory === cat.name ? 'bg-[var(--theme)] border-[var(--theme)] text-black' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300'}`}>
                    {cat.name === 'Most Voted' && <Heart className="w-3 h-3 fill-current" />}
                    {cat.name} <span className={`px-1.5 py-0.5 rounded-md ${activeCategory === cat.name ? 'bg-black/20' : 'bg-white/10'}`}>{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 mt-8">
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {filteredGames.map(game => (
                  <GameCard key={game.id} game={game} isFav={favorites.includes(game.id)} rating={ratings[game.id]} stats={playStats[game.id]} onLaunch={launchGame} onFav={setFavorites} onRate={handleRate} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                <SearchX className="w-16 h-16 text-zinc-800 mb-6" />
                <h2 className="text-2xl font-black mb-2 text-zinc-400">Empty results</h2>
                {suggestion && (
                  <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black uppercase mb-1 text-[var(--theme)]">Maybe this?</p>
                    <button onClick={() => setSearchQuery(suggestion)} className="text-white font-bold hover:underline">{suggestion}</button>
                  </div>
                )}
                <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="mt-8 flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl font-bold text-xs hover:bg-[var(--theme)] hover:text-black transition-all uppercase tracking-widest"><RotateCcw className="w-3 h-3" /> Reset Grid</button>
              </div>
            )}
          </main>
        </>
      ) : (
        <main className="max-w-3xl mx-auto px-4 mt-12 animate-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-black mb-8 flex items-center gap-3 tracking-tighter">Hall of Fame</h1>
          <div className="space-y-3">
            {leaderboard.map((game, i) => (
              <div key={`rank-${game.id}`} onClick={() => launchGame(game)} className="group bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-[var(--theme)]/50 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : i === 1 ? 'bg-zinc-300 text-black shadow-lg shadow-zinc-300/20' : i === 2 ? 'bg-orange-600 text-black shadow-lg shadow-orange-600/20' : 'bg-zinc-800 text-zinc-500'}`}>{i + 1}</div>
                <img src={game.thumbnail} className="w-12 h-12 rounded-lg object-cover" alt="" />
                <div className="flex-1">
                  <h3 className="font-bold text-sm group-hover:text-[var(--theme)] transition-colors">{game.title}</h3>
                  <div className="flex gap-2 items-center">
                    <p className="text-[9px] text-zinc-600 uppercase font-black">{game.category}</p>
                    {ratings[game.id] === 'up' && <ThumbsUp className="w-3 h-3 text-[var(--theme)]" />}
                  </div>
                </div>
                <div className="text-right text-[10px] font-black text-zinc-500 uppercase">
                  <div className="flex items-center gap-1 justify-end text-zinc-200"><Clock className="w-3 h-3 text-[var(--theme)]" /> {playStats[game.id]?.time || 0}m</div>
                  <div className="opacity-50">Score: {(playStats[game.id]?.time || 0) + (ratings[game.id] === 'up' ? 50 : -50)}</div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}

function GameCard({ game, isFav, rating, stats, onLaunch, onFav, onRate }) {
  const isUtility = ['request', 'report'].includes(game.id);
  return (
    <div className="group relative bg-zinc-900/40 rounded-[2rem] overflow-hidden cursor-pointer border border-white/5 hover:border-[var(--theme)]/30 transition-all duration-300 flex flex-col" onClick={() => onLaunch(game)}>
      <div className="relative aspect-[4/3] bg-zinc-800/20 overflow-hidden">
        <img src={game.thumbnail} alt={game.title} className={`absolute inset-0 w-full h-full transition-transform duration-700 ${isUtility ? 'object-contain p-10' : 'object-cover group-hover:scale-110'}`} />
        
        {!isUtility && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <div className="flex gap-1.5 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button onClick={(e) => { e.stopPropagation(); onRate(game.id, 'up'); }} className={`p-2 rounded-xl backdrop-blur-xl transition-all ${rating === 'up' ? 'bg-[var(--theme)] text-black' : 'bg-black/40 text-white hover:bg-black/60'}`}>
                <ThumbsUp className={`w-3.5 h-3.5 ${rating === 'up' ? 'fill-current' : ''}`} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onRate(game.id, 'down'); }} className={`p-2 rounded-xl backdrop-blur-xl transition-all ${rating === 'down' ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}>
                <ThumbsDown className={`w-3.5 h-3.5 ${rating === 'down' ? 'fill-current' : ''}`} />
              </button>
            </div>
            <button onClick={(e) => { e.stopPropagation(); 
              const saved = JSON.parse(localStorage.getItem('capy-favorites') || '[]');
              const next = saved.includes(game.id) ? saved.filter(id => id !== game.id) : [...saved, game.id];
              localStorage.setItem('capy-favorites', JSON.stringify(next));
              onFav(next);
            }} className={`p-2 rounded-xl backdrop-blur-xl transition-all ${isFav ? 'bg-[var(--theme)] text-black' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60'}`}>
              <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        )}

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
          <div className="w-14 h-14 bg-[var(--theme)] rounded-2xl flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-all duration-300 rotate-[-10deg] group-hover:rotate-0"><Play className="w-7 h-7 text-black fill-current translate-x-0.5" /></div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h3 className="font-bold text-white truncate text-sm flex-1 group-hover:text-[var(--theme)] transition-colors tracking-tight">{game.title}</h3>
          {!isUtility && stats?.time > 0 && <span className="text-[9px] font-black text-zinc-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{stats.time}m</span>}
        </div>
        <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.15em]">{game.category}</p>
      </div>
    </div>
  );
}

export default App;
