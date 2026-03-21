import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  Star, Trash2, Palette, EyeOff, Eye, Clock, Trophy,
  Dices, AlertTriangle, Battery, Zap, ChevronDown, Upload, RotateCcw, Check
} from 'lucide-react';

import gamesDataRaw from './games.json';

function App() {
  const gamesData = useMemo(() => {
    try {
      if (!gamesDataRaw || !Array.isArray(gamesDataRaw)) return [];
      return gamesDataRaw;
    } catch (e) {
      return [];
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [wipeConfirm, setWipeConfirm] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);
  
  const [theme, setTheme] = useState(() => localStorage.getItem('capy-theme') || '#10A5F5');
  const [disguise, setDisguise] = useState(() => localStorage.getItem('capy-stealth-type') || 'none');
  const [panicKey, setPanicKey] = useState(() => localStorage.getItem('capy-panic-key') || '');
  const [panicUrl, setPanicUrl] = useState(() => localStorage.getItem('capy-panic-url') || 'https://google.com');

  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('capy-favorites') || '[]'));
  const [playtimes, setPlaytimes] = useState(() => JSON.parse(localStorage.getItem('capy-playtimes') || '{}'));

  const sessionRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (panicKey && panicKey.trim() !== "" && e.key.toLowerCase() === panicKey.toLowerCase()) {
        window.location.href = panicUrl.startsWith('http') ? panicUrl : `https://${panicUrl}`;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicKey, panicUrl]);

  const categoriesWithCounts = useMemo(() => {
    const uniqueCats = [...new Set(gamesData.map(g => g?.category).filter(Boolean))];
    const final = [{ name: 'All', count: gamesData.length }, ...uniqueCats.map(cat => ({ name: cat, count: gamesData.filter(g => g.category === cat).length }))];
    if (favorites.length > 0) final.unshift({ name: 'Favorites', count: favorites.length });
    return final;
  }, [gamesData, favorites]);

  const launchContent = (item) => {
    if (!item?.url) return;
    if (!['request', 'report'].includes(item.id)) {
      sessionRef.current = { id: item.id, start: Date.now() };
    }
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.title = "DO NOT REFRESH";
      win.document.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
      const iframe = win.document.createElement('iframe');
      iframe.src = item.url;
      iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
      iframe.allow = "fullscreen";
      win.document.body.appendChild(iframe);
      const titleInterval = setInterval(() => {
        if (win.closed) clearInterval(titleInterval);
        else if (win.document.title !== "DO NOT REFRESH") win.document.title = "DO NOT REFRESH";
      }, 500);
    }
  };

  const handleResetSettings = () => {
    if (resetSuccess) return;
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
      return;
    }
    const defaultTheme = '#10A5F5';
    setTheme(defaultTheme);
    setDisguise('none');
    setPanicKey('');
    setPanicUrl('https://google.com');
    localStorage.setItem('capy-theme', defaultTheme);
    localStorage.setItem('capy-stealth-type', 'none');
    localStorage.setItem('capy-panic-key', '');
    localStorage.setItem('capy-panic-url', 'https://google.com');
    setResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  const handleWipeEverything = () => {
    if (wipeSuccess) return;
    if (!wipeConfirm) {
      setWipeConfirm(true);
      setTimeout(() => setWipeConfirm(false), 3000);
      return;
    }
    setWipeConfirm(false);
    setWipeSuccess(true);
    localStorage.clear();
    setTimeout(() => window.location.reload(), 1000);
  };

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
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-[var(--theme)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--theme)]/20"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-black hidden lg:block tracking-tighter">Capybara <span className="text-[var(--theme)]">Science</span></span>
          </div>

          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs outline-none focus:border-[var(--theme)]/50" />
            </div>
            <button onClick={() => {
              const playable = gamesData.filter(g => !['request', 'report'].includes(g.id));
              if (playable.length > 0) launchContent(playable[Math.floor(Math.random() * playable.length)]);
            }} className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-[var(--theme)] hover:text-black transition-all shrink-0"><Dices className="w-5 h-5" /></button>
          </div>

          <div className="flex items-center justify-end gap-3">
             <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-500 hover:text-[var(--theme)] shrink-0 transition-colors"><Settings className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      <div className="sticky top-16 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-white/5 px-4 pt-1.5 mb-[-1rem]">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-4">
          {categoriesWithCounts.map(cat => (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border shrink-0 transition-all ${activeCategory === cat.name ? 'bg-[var(--theme)] border-[var(--theme)] text-black' : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredGames.map(game => (
          <GameCard key={game.id} game={game} isFav={favorites.includes(game.id)} onLaunch={launchContent} onFav={setFavorites} playtime={playtimes[game.id] ? Math.floor(playtimes[game.id]/60) + 'm' : '0m'} />
        ))}
      </main>

      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSettings(false)} />
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative z-10 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-[var(--theme)]" /> System Config</h2>
              <X onClick={() => setShowSettings(false)} className="cursor-pointer text-zinc-400 hover:text-white" />
            </div>
            
            <div className="space-y-5">
              <section className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Tab Disguise</label>
                <select value={disguise} onChange={(e) => setDisguise(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs">
                  <option value="none" className="bg-zinc-900">Default</option>
                  <option value="drive" className="bg-zinc-900">Google Drive</option>
                </select>
              </section>

              <section className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <label className="text-[10px] uppercase font-black text-red-400 tracking-widest flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Panic Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" maxLength="1" placeholder="Key" value={panicKey} onChange={(e) => { setPanicKey(e.target.value); localStorage.setItem('capy-panic-key', e.target.value); }} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-center text-xs outline-none" />
                  <input type="text" placeholder="URL" value={panicUrl} onChange={(e) => { setPanicUrl(e.target.value); localStorage.setItem('capy-panic-url', e.target.value); }} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-3 text-xs outline-none" />
                </div>
              </section>

              {/* UPDATED: COLOR PICKER + HEX INPUT */}
              <section className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Accent Color</label>
                <div className="flex gap-2">
                   <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                      <input 
                        type="color" 
                        value={theme} 
                        onChange={(e) => { setTheme(e.target.value); localStorage.setItem('capy-theme', e.target.value); }} 
                        className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer bg-transparent border-none" 
                      />
                   </div>
                   <input 
                    type="text" 
                    value={theme} 
                    onChange={(e) => { setTheme(e.target.value); localStorage.setItem('capy-theme', e.target.value); }} 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs outline-none focus:border-[var(--theme)] transition-colors font-mono" 
                    placeholder="#000000"
                  />
                </div>
              </section>

              <div className="pt-4 flex flex-col gap-2">
                <button onClick={handleResetSettings} disabled={resetSuccess} className={`w-full p-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${resetSuccess ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : resetConfirm ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                  {resetSuccess ? <Check className="w-3 h-3" /> : resetConfirm ? <AlertTriangle className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
                  {resetSuccess ? "Settings Reset!" : resetConfirm ? "Are you sure?" : "Reset Settings Only"}
                </button>
                
                <button onClick={handleWipeEverything} disabled={wipeSuccess} className={`w-full p-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${wipeSuccess ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : wipeConfirm ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'border-red-500/20 text-red-500 hover:bg-red-500/10'}`}>
                  {wipeSuccess ? <Check className="w-3 h-3" /> : wipeConfirm ? <AlertTriangle className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                  {wipeSuccess ? "Data Wiped!" : wipeConfirm ? "Confirm Full Wipe?" : "Wipe Everything"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GameCard({ game, isFav, onLaunch, onFav, playtime }) {
  const isUtility = ['request', 'report'].includes(game.id);
  return (
    <div className="group bg-zinc-900/40 rounded-[2rem] overflow-hidden border border-white/5 hover:border-[var(--theme)]/30 transition-all flex flex-col cursor-pointer" onClick={() => onLaunch(game)}>
      <div className="relative aspect-[4/3] bg-black/20">
        <img src={game.thumbnail} className={`absolute inset-0 m-auto transition-transform duration-500 group-hover:scale-110 ${isUtility ? 'w-24' : 'w-full h-full object-cover'}`} alt="" />
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
