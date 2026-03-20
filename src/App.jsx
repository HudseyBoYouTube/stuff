import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  Zap, ZapOff, BellOff, Bell, ArrowUp, Dices 
} from 'lucide-react';
import gamesDataRaw from './games.json';

function App() {
  // --- DATA & STATE ---
  const gamesData = useMemo(() => {
    try {
      return Array.isArray(gamesDataRaw) ? gamesDataRaw : [];
    } catch (e) {
      console.error("Failed to load games.json:", e);
      return [];
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const [performanceMode, setPerformanceMode] = useState(() => localStorage.getItem('perf-mode') === 'true');
  const [panicUrl, setPanicUrl] = useState(localStorage.getItem('panic-url') || 'https://classroom.google.com');
  const [panicKey, setPanicKey] = useState(localStorage.getItem('panic-key') || 'Escape');
  const [panicEnabled, setPanicEnabled] = useState(() => localStorage.getItem('panic-enabled') !== 'false');

  // --- LOGIC: GAME LAUNCHER ---
  const launchGame = (game) => {
    if (!game || !game.url) return;
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.title = "DO NOT REFRESH";
      const script = win.document.createElement('script');
      script.textContent = `
        document.title = "DO NOT REFRESH";
        setInterval(() => {
          if (document.title !== "DO NOT REFRESH") document.title = "DO NOT REFRESH";
        }, 100); 
      `;
      win.document.head.appendChild(script);
      win.document.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
      const iframe = win.document.createElement('iframe');
      iframe.src = game.url;
      iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
      iframe.allow = "fullscreen";
      win.document.body.appendChild(iframe);
    }
  };

  // --- LOGIC: FILTERS ---
  const categories = useMemo(() => {
    const cats = gamesData.map(g => g?.category).filter(Boolean);
    return ['All', ...new Set(cats)];
  }, [gamesData]);

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return gamesData.filter(g => {
      const matchesSearch = g?.title?.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || g?.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, gamesData]);

  const handleRandomGame = () => {
    if (filteredGames.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredGames.length);
      launchGame(filteredGames[randomIndex]);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (panicEnabled && e.key === panicKey) {
        window.location.href = panicUrl.startsWith('http') ? panicUrl : `https://${panicUrl}`;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicKey, panicUrl, panicEnabled]);

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased">
      {/* Scroll to Top */}
      {showBackToTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-[60] p-4 bg-[#10A5F5] text-black rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowSettings(false)} />
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative z-10 shadow-2xl">
            <X onClick={() => setShowSettings(false)} className="absolute top-4 right-4 cursor-pointer text-zinc-500 hover:text-white" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#10A5F5]" /> Settings
            </h2>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-sm flex items-center gap-2">
                    {panicEnabled ? <Bell className="w-4 h-4 text-[#10A5F5]" /> : <BellOff className="w-4 h-4 text-zinc-500" />}
                    Panic Key {panicEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                  <button onClick={() => {
                    setPanicEnabled(!panicEnabled);
                    localStorage.setItem('panic-enabled', !panicEnabled);
                  }} className={`w-10 h-5 rounded-full relative transition-colors ${panicEnabled ? 'bg-[#10A5F5]' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${panicEnabled ? 'left-6' : 'left-1'}`} />
                  </button>
               </div>
               <div className={`grid grid-cols-2 gap-4 transition-opacity ${!panicEnabled && 'opacity-30 pointer-events-none'}`}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Panic URL</label>
                    <input type="text" value={panicUrl} onChange={(e) => setPanicUrl(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-2 text-sm outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase px-1 text-center block">Key</label>
                    <input type="text" value={panicKey} onChange={(e) => setPanicKey(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-2 text-sm outline-none text-center" />
                  </div>
               </div>
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-sm flex items-center gap-2">
                    {performanceMode ? <ZapOff className="w-4 h-4 text-yellow-500" /> : <Zap className="w-4 h-4 text-yellow-500" />} Performance Mode
                  </div>
                  <button onClick={() => {
                    setPerformanceMode(!performanceMode);
                    localStorage.setItem('perf-mode', !performanceMode);
                  }} className={`w-10 h-5 rounded-full relative ${performanceMode ? 'bg-[#10A5F5]' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${performanceMode ? 'left-6' : 'left-1'}`} />
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-md h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10A5F5] rounded-lg flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-black hidden md:block">Capybara <span className="text-[#10A5F5]">Science</span></span>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input type="text" placeholder="Search games..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-[#10A5F5]/50" />
            </div>
            <button onClick={handleRandomGame} className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-[#10A5F5] hover:text-black transition-all group">
              <Dices className="w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
            </button>
          </div>
          <div className="flex items-center justify-end">
            <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-400 hover:text-[#10A5F5] transition-colors"><Settings className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      {/* Sticky Category Bar */}
      <div className="sticky top-16 z-40 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)} 
              className={`px-5 py-2 rounded-full text-xs font-bold border shrink-0 transition-none ${activeCategory === cat ? 'bg-[#10A5F5] border-[#10A5F5] text-black shadow-lg shadow-[#10A5F5]/20' : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Game Grid */}
      <main className="max-w-7xl mx-auto px-4 mt-8">
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredGames.map(game => (
              <div key={game.id} className="group relative bg-zinc-900/50 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#10A5F5] transition-none" onClick={() => launchGame(game)}>
                <div className="relative aspect-[4/3] bg-zinc-800/20 overflow-hidden">
                  <img src={game.thumbnail} alt={game.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-12 h-12 bg-[#10A5F5] rounded-full flex items-center justify-center shadow-xl"><Play className="w-6 h-6 text-black fill-current" /></div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white truncate text-sm group-hover:text-[#10A5F5] transition-colors">{game.title}</h3>
                  <p className="text-[11px] text-zinc-500">{game.category}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">No games found... try a different search!</div>
        )}
      </main>
    </div>
  );
}

export default App;
