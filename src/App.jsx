import { useState, useMemo, useEffect } from 'react';
import { Search, Gamepad2, Play, Settings, X, ShieldAlert, Zap, ZapOff, BellOff, Bell, ArrowUp, Dices } from 'lucide-react';
import gamesDataRaw from './games.json';

function App() {
  const gamesData = useMemo(() => Array.isArray(gamesDataRaw) ? gamesDataRaw : [], []);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Settings States
  const [performanceMode, setPerformanceMode] = useState(() => localStorage.getItem('perf-mode') === 'true');
  const [panicUrl, setPanicUrl] = useState(localStorage.getItem('panic-url') || 'https://classroom.google.com');
  const [panicKey, setPanicKey] = useState(localStorage.getItem('panic-key') || 'Escape');
  const [panicEnabled, setPanicEnabled] = useState(() => localStorage.getItem('panic-enabled') !== 'false');

  // Function to launch a game in the "DO NOT REFRESH" tab
  const launchGame = (game) => {
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

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return gamesData.filter(g => {
      const matchesSearch = g.title?.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || g.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, gamesData]);

  // Logic to pick a random game from the filtered list
  const handleRandomGame = () => {
    if (filteredGames.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredGames.length);
      launchGame(filteredGames[randomIndex]);
    }
  };

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased">
      {showBackToTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-[60] p-4 bg-[#10A5F5] text-black rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-md h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10A5F5] rounded-lg flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-black hidden md:block">Capybara <span className="text-[#10A5F5]">Science</span></span>
          </div>

          {/* Search + Random Button Group */}
          <div className="flex items-center gap-2 w-full max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search games..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-[#10A5F5]/50" 
              />
            </div>
            
            {/* NEW: Random Game Button */}
            <button 
              onClick={handleRandomGame}
              title="Surprise Me!"
              className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-[#10A5F5] hover:text-black hover:border-[#10A5F5] transition-all group"
            >
              <Dices className="w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          {/* Settings Toggle */}
          <div className="flex items-center justify-end">
            <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-400 hover:text-[#10A5F5] transition-none">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Sticky Category Bar */}
      <div className="sticky top-16 z-40 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 px-4 mb-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)} 
              className={`px-5 py-2 rounded-full text-xs font-bold border shrink-0 transition-none ${activeCategory === cat ? 'bg-[#10A5F5] border-[#10A5F5] text-black' : 'bg-white/5 border-white/10 text-zinc-400'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredGames.map(game => (
            <div 
              key={game.id}
              className="group relative bg-zinc-900/50 rounded-2xl overflow-hidden cursor-pointer flex flex-col border border-white/5 hover:border-[#10A5F5] transition-none"
              onClick={() => launchGame(game)}
            >
              <div className="relative aspect-[4/3] bg-zinc-800/20 overflow-hidden shrink-0 pointer-events-none">
                <img src={game.thumbnail} alt={game.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#10A5F5] rounded-full flex items-center justify-center"><Play className="w-6 h-6 text-black fill-current" /></div>
                </div>
              </div>
              <div className="p-4 flex-1 pointer-events-none">
                <h3 className="font-bold text-white truncate text-sm group-hover:text-[#10A5F5]">{game.title}</h3>
                <p className="text-[11px] text-zinc-500">{game.category}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
