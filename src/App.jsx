import { useState, useMemo, useEffect } from 'react';
import { Search, Gamepad2, Play, Settings, X, ShieldAlert, Clock } from 'lucide-react';
import gamesData from './games.json';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);

  const GameCard = ({ game }) => {
    const isUtility = ['request', 'report'].includes(game.id);
    
    return (
      <div 
        className="group relative bg-zinc-900/50 rounded-2xl overflow-hidden cursor-pointer flex flex-col border-2 border-transparent hover:border-[#10A5F5] bg-clip-border"
        style={{ contain: 'layout', willChange: 'contents' }}
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
        {/* THUMBNAIL AREA - STOPS ALL MOVEMENT */}
        <div className="relative aspect-[4/3] bg-zinc-800/20 overflow-hidden shrink-0 pointer-events-none">
          <img 
            src={game.thumbnail} 
            alt={game.title} 
            className={`absolute inset-0 w-full h-full pointer-events-none ${isUtility ? 'object-contain p-8' : 'object-cover'}`}
          />
          {/* Overlay - INSTANT SWAP (No Animation) */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-[#10A5F5] rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-black fill-current" />
            </div>
          </div>
        </div>
        
        {/* INFO AREA - INSTANT COLOR SWAP */}
        <div className="p-4 flex-1 pointer-events-none">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h3 className="font-bold text-white truncate text-sm group-hover:text-[#10A5F5]">
              {game.title}
            </h3>
            <span className="text-[9px] font-extrabold uppercase text-[#10A5F5] px-2 py-0.5 bg-[#10A5F5]/10 rounded-md border border-[#10A5F5]/20">
              {game.category}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-zinc-500">
              {isUtility ? 'Click to fill out' : 'Click to play'}
            </p>
          </div>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased overflow-y-scroll">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-md h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10A5F5] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,165,245,0.2)]">
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
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-[#10A5F5]/50" 
            />
          </div>

          <div className="flex items-center gap-4 justify-self-end">
            <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-400 hover:text-[#10A5F5]">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-8 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)} 
              className={`px-5 py-2 rounded-full text-xs font-bold border transition-none ${activeCategory === cat ? 'bg-[#10A5F5] border-[#10A5F5] text-black' : 'bg-white/5 border-white/10 text-zinc-400'}`}
            >
              {cat}
            </button>
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
