import { useState, useMemo, useEffect } from 'react';
import { Search, Gamepad2, Play, Settings, X, ShieldAlert, Zap, ZapOff, Clock, BatteryCharging, BatteryFull, Calendar } from 'lucide-react';

// Replace this with your actual import or fetch logic
import gamesDataRaw from './games.json';

function App() {
  // Ensure we have a valid array even if the JSON is wonky
  const gamesData = useMemo(() => Array.isArray(gamesDataRaw) ? gamesDataRaw : [], []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings States
  const [performanceMode, setPerformanceMode] = useState(() => localStorage.getItem('perf-mode') === 'true');
  const [panicUrl, setPanicUrl] = useState(localStorage.getItem('panic-url') || 'https://classroom.google.com');

  const categories = useMemo(() => {
    const cats = gamesData.map(g => g.category);
    return ['All', ...new Set(cats.filter(Boolean))];
  }, [gamesData]);

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return gamesData.filter(g => {
      const matchesSearch = g.title?.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || g.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, gamesData]);

  const GameCard = ({ game }) => {
    const isUtility = ['request', 'report'].includes(game.id);
    return (
      <div 
        className="group relative bg-zinc-900/50 rounded-2xl overflow-hidden cursor-pointer flex flex-col border border-white/5 hover:border-[#10A5F5]"
        onClick={() => {
          const win = window.open('about:blank', '_blank');
          if (win) {
            win.document.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
            const iframe = win.document.createElement('iframe');
            iframe.src = game.url;
            iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
            iframe.allow = "fullscreen";
            win.document.body.appendChild(iframe);
          }
        }}
      >
        <div className="relative aspect-[4/3] bg-zinc-800/20 overflow-hidden shrink-0 pointer-events-none">
          <img 
            src={game.thumbnail} 
            alt={game.title} 
            className={`absolute inset-0 w-full h-full ${isUtility ? 'object-contain p-8' : 'object-cover'}`} 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
            <div className="w-12 h-12 bg-[#10A5F5] rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-black fill-current" />
            </div>
          </div>
        </div>
        <div className="p-4 flex-1 pointer-events-none">
          <h3 className="font-bold text-white truncate text-sm group-hover:text-[#10A5F5]">{game.title}</h3>
          <p className="text-[11px] text-zinc-500">{game.category}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased overflow-y-scroll">
      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-sm w-full relative shadow-2xl z-10">
            <X onClick={() => setShowSettings(false)} className="absolute top-4 right-4 cursor-pointer text-zinc-500 hover:text-white" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <ShieldAlert className="w-5 h-5 text-[#10A5F5]" /> Settings
            </h2>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-sm text-white flex items-center gap-2">
                    {performanceMode ? <ZapOff className="w-4 h-4 text-yellow-500" /> : <Zap className="w-4 h-4 text-yellow-500" />}
                    Performance Mode
                  </div>
                  <button onClick={() => setPerformanceMode(!performanceMode)} className={`w-10 h-5 rounded-full relative ${performanceMode ? 'bg-[#10A5F5]' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${performanceMode ? 'left-6' : 'left-1'}`} />
                  </button>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Panic URL</label>
                  <input type="text" value={panicUrl} onChange={(e) => setPanicUrl(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-xl p-2 text-sm text-white" />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-md h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10A5F5] rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black">Capybara <span className="text-[#10A5F5]">Science</span></span>
          </div>

          <div className="relative w-full max-w-md justify-self-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search games..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm outline-none" 
            />
          </div>

          <div className="flex items-center gap-4 justify-self-end">
            <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-400 hover:text-[#10A5F5]">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-8 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-xs font-bold border ${activeCategory === cat ? 'bg-[#10A5F5] border-[#10A5F5] text-black' : 'bg-white/5 border-white/10 text-zinc-400'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredGames.length > 0 ? (
            filteredGames.map(game => <GameCard key={game.id} game={game} />)
          ) : (
            <div className="col-span-full text-center py-20 text-zinc-500 italic">No games found...</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
