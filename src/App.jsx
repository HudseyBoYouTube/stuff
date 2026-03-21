import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  Star, Trash2, Palette, EyeOff, Eye, 
  Dices, AlertTriangle
} from 'lucide-react';

import gamesDataRaw from './games.json';

function App() {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('capy-theme') || '#10A5F5');
  const [stealthMode, setStealthMode] = useState(() => localStorage.getItem('capy-stealth') === 'true');
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('capy-favorites') || '[]'));
  const [confirmClear, setConfirmClear] = useState(false);

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

  const launchGame = (game) => {
    if (!game || !game.url) return;
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

  const launchRandom = () => {
    const playableGames = gamesData.filter(g => g.id !== 'request' && g.id !== 'report');
    if (playableGames.length > 0) {
      const randomGame = playableGames[Math.floor(Math.random() * playableGames.length)];
      launchGame(randomGame);
    }
  };

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return gamesData.filter(g => {
      const matchesSearch = g?.title?.toLowerCase().includes(q);
      let matchesCategory = true;
      if (activeCategory === 'Favorites') matchesCategory = favorites.includes(g.id);
      else if (activeCategory !== 'All') matchesCategory = g?.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, gamesData, favorites]);

  const categoriesWithCounts = useMemo(() => {
    const uniqueCats = [...new Set(gamesData.map(g => g?.category).filter(Boolean))];
    const base = uniqueCats.map(cat => ({ name: cat, count: gamesData.filter(g => g.category === cat).length }));
    const final = [{ name: 'All', count: gamesData.length }, ...base];
    if (favorites.length > 0) final.unshift({ name: 'Favorites', count: favorites.length });
    return final;
  }, [gamesData, favorites]);

  if (dataError || gamesData.length === 0) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-black">Data Error</h1>
        <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-white/10 rounded-full font-bold">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased" style={{ '--theme': theme }}>
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/5 h-16 flex items-center px-4 bg-[#09090b]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 bg-[var(--theme)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--theme)]/20"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-black hidden md:block tracking-tighter">Capybara <span className="text-[var(--theme)]">Science</span></span>
          </div>

          <div className="flex items-center gap-2 w-full max-w-sm mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-10 text-xs outline-none focus:border-[var(--theme)]/50 text-center" 
              />
            </div>
            <button onClick={launchRandom} title="Random Game" className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-[var(--theme)] hover:text-black transition-all shrink-0"><Dices className="w-5 h-5" /></button>
          </div>

          <div className="flex items-center justify-end">
             <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-500 hover:text-[var(--theme)]"><Settings className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      {/* COMPACT CATEGORY NAV - Moved down with mt-2 */}
      <div className="sticky top-16 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-white/5 px-4 pt-2 pb-1.5">
        <div className="max-w-7xl mx-auto"> 
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {categoriesWithCounts.map(cat => (
              <button 
                key={cat.name} 
                onClick={() => setActiveCategory(cat.name)} 
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border shrink-0 transition-all 
                  ${activeCategory === cat.name 
                    ? 'bg-[var(--theme)] border-[var(--theme)] text-black' 
                    : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GAME GRID */}
      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredGames.map(game => (
            <GameCard 
              key={game.id} 
              game={game} 
              isFav={favorites.includes(game.id)} 
              onLaunch={launchGame} 
              onFav={setFavorites} 
            />
          ))}
        </div>
      </main>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative z-10 shadow-2xl">
            <X onClick={() => setShowSettings(false)} className="absolute top-4 right-4 cursor-pointer text-zinc-400 hover:text-red-500" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-[var(--theme)]" /> System Config</h2>
            
            <div className="space-y-4">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="text-sm flex items-center gap-2">{stealthMode ? <EyeOff className="w-4 h-4 text-[var(--theme)]" /> : <Eye className="w-4 h-4" />} Tab Disguise</div>
                  <button onClick={() => setStealthMode(!stealthMode)} className={`w-10 h-5 rounded-full relative transition-all ${stealthMode ? 'bg-[var(--theme)]' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${stealthMode ? 'left-6' : 'left-1'}`} />
                  </button>
               </div>

               <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-sm mb-3 font-bold flex items-center gap-2"><Palette className="w-4 h-4" /> Theme Color</div>
                  <div className="flex gap-3">
                    {['#10A5F5', '#10f57b', '#f5107b', '#f5a610'].map(c => (
                      <button key={c} onClick={() => {setTheme(c); localStorage.setItem('capy-theme', c);}} className={`w-8 h-8 rounded-full border-2 transition-all ${theme === c ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{background: c}} />
                    ))}
                  </div>
               </div>

               <button onClick={() => { if(confirmClear) { localStorage.clear(); window.location.reload(); } else setConfirmClear(true); }} className="w-full p-4 rounded-2xl border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/10 transition-colors">
                 <Trash2 className="w-4 h-4 inline mr-2" /> {confirmClear ? "Wipe All Data?" : "Clear App Data"}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GameCard({ game, isFav, onLaunch, onFav }) {
  const isUtility = ['request', 'report'].includes(game.id);

  return (
    <div className="group bg-zinc-900/40 rounded-[2rem] overflow-hidden border border-white/5 hover:border-[var(--theme)]/30 transition-all flex flex-col cursor-pointer" onClick={() => onLaunch(game)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
        <img 
          src={game.thumbnail} 
          className={`absolute inset-0 m-auto transition-transform duration-500 group-hover:scale-110 
            ${isUtility ? 'w-36 h-36 object-contain opacity-70' : 'w-full h-full object-cover'}`} 
          alt="" 
        />
        {!isUtility && (
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); 
                const saved = JSON.parse(localStorage.getItem('capy-favorites') || '[]');
                const next = saved.includes(game.id) ? saved.filter(id => id !== game.id) : [...saved, game.id];
                localStorage.setItem('capy-favorites', JSON.stringify(next));
                onFav(next);
              }} 
              className={`p-2 rounded-xl backdrop-blur-md transition-all 
                ${isFav ? 'bg-[var(--theme)] text-black' : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'}`}
            >
              <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-10 h-10 text-[var(--theme)] fill-current" />
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-sm truncate group-hover:text-[var(--theme)] text-zinc-100">{game.title}</h3>
        <p className="text-[9px] text-zinc-500 uppercase font-black">{game.category}</p>
      </div>
    </div>
  );
}

export default App;
