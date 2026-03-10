import { useState, useMemo, useEffect } from 'react';
import { Search, Gamepad2, Play, Settings, X, ShieldAlert, Keyboard, Power, Heart, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gamesData from './games.json';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [panicUrl, setPanicUrl] = useState(localStorage.getItem('panic-url') || 'https://classroom.google.com');
  const [panicKey, setPanicKey] = useState(localStorage.getItem('panic-key') || 'Escape');
  const [isRecording, setIsRecording] = useState(false);
  const [panicEnabled, setPanicEnabled] = useState(localStorage.getItem('panic-enabled') !== 'false');
  
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorite-games');
    return saved ? JSON.parse(saved) : [];
  });

  const presets = {
    none: { title: 'Capybara Science', favicon: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' },
    powerschool: { title: 'PowerSchool', favicon: 'https://www.powerschool.com/favicon.ico' },
    google: { title: 'My Drive - Google Drive', favicon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' }
  };

  useEffect(() => {
    localStorage.setItem('favorite-games', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!panicEnabled) return;
      if (isRecording) {
        e.preventDefault();
        setPanicKey(e.key);
        localStorage.setItem('panic-key', e.key);
        setIsRecording(false);
        return;
      }
      if (e.key === panicKey) window.location.href = panicUrl;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicKey, panicUrl, isRecording, panicEnabled]);

  const handleRandomGame = () => {
    const playableGames = gamesData.filter(game => 
      !['request', 'report'].includes(game.id.toLowerCase())
    );
    if (playableGames.length > 0) {
      const randomGame = playableGames[Math.floor(Math.random() * playableGames.length)];
      handleSelectGame(randomGame);
    }
  };

  const handleSelectGame = (game) => {
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.title = 'DO NOT REFRESH';
      const doc = win.document;
      doc.body.style.margin = '0';
      doc.body.style.padding = '0';
      doc.body.style.overflow = 'hidden';
      doc.body.style.backgroundColor = '#000';
      const iframe = doc.createElement('iframe');
      iframe.src = game.url;
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';
      iframe.style.display = 'block';
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      doc.body.appendChild(iframe);
    }
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(gameId => gameId !== id) : [...prev, id]);
  };

  const filteredGames = useMemo(() => {
    return gamesData.filter(game =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const favoriteGamesList = useMemo(() => filteredGames.filter(g => favorites.includes(g.id)), [filteredGames, favorites]);
  const otherGamesList = useMemo(() => filteredGames.filter(g => !favorites.includes(g.id)), [filteredGames, favorites]);

  const GameCard = ({ game }) => (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} whileHover={{ y: -4 }}
      className="group relative bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden cursor-pointer" onClick={() => handleSelectGame(game)}>
      <div className={`aspect-[4/3] overflow-hidden bg-zinc-800/50 flex items-center justify-center relative ${
          game.id === 'sandspiel' ? 'p-2' :
          game.category === 'Community' ? 'p-6' : 'p-0'
        }`}>
        <img 
            src={game.thumbnail} 
            alt={game.title} 
            referrerPolicy="no-referrer" 
            className={`w-full h-full transition-transform duration-500 group-hover:scale-110 ${
                ['Community', 'sandspiel'].includes(game.id) || game.category === 'Community' ? 'object-contain' : 'object-cover'
            }`} 
        />
        <button onClick={(e) => toggleFavorite(e, game.id)} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors">
          <Heart className={`w-4 h-4 ${favorites.includes(game.id) ? 'fill-[#10A5F5] text-[#10A5F5]' : 'text-white'}`} />
        </button>
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-[#10A5F5] rounded-full flex items-center justify-center shadow-xl shadow-[#10A5F5]/40 transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <Play className="w-6 h-6 text-black fill-current" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-zinc-100 group-hover:text-[#10A5F5] transition-colors">{game.title}</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#10A5F5] px-2 py-0.5 bg-[#10A5F5]/10 rounded-md">{game.category}</span>
        </div>
        <p className="text-xs text-zinc-500">
            {['request', 'report'].includes(game.id) ? 'Click to fill out' : 'Click to play'}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center relative">
          
          {/* Logo - Left Aligned */}
          <div className="flex items-center gap-2 z-10">
            <div className="w-8 h-8 bg-[#10A5F5] rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">Capybara <span className="text-[#10A5F5]">Science</span></span>
          </div>

          {/* Search Bar - Center Aligned */}
          <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-sm md:max-w-md px-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search games..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#10A5F5]/50 transition-colors" 
              />
            </div>
            <button onClick={handleRandomGame} title="Play Random Game"
              className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-[#10A5F5]/20 hover:border-[#10A5F5]/50 transition-all group shrink-0">
              <Shuffle className="w-4 h-4 text-zinc-400 group-hover:text-[#10A5F5]" />
            </button>
          </div>

          {/* Settings - Right Aligned */}
          <div className="ml-auto z-10">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Settings className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal Restored */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-black border border-white/10 p-6 rounded-2xl max-w-sm w-full relative shadow-2xl">
              <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"> <ShieldAlert className="w-5 h-5 text-[#10A5F5]" /> Settings </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-sm">Enable Panic Key</span>
                  <button onClick={() => { setPanicEnabled(!panicEnabled); localStorage.setItem('panic-enabled', !panicEnabled); }} className={`w-10 h-5 rounded-full relative transition-colors ${panicEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${panicEnabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                {panicEnabled && (
                  <div className="space-y-4">
                    <input type="text" value={panicUrl} onChange={(e) => {setPanicUrl(e.target.value); localStorage.setItem('panic-url', e.target.value);}} className="w-full bg-black text-zinc-100 border border-white/10 rounded-xl p-3 text-sm focus:border-[#10A5F5]" />
                    <button onClick={() => setIsRecording(true)} className={`w-full flex items-center justify-between p-3 rounded-xl border ${isRecording ? 'border-[#10A5F5] animate-pulse' : 'border-white/10 bg-white/5'}`}>
                        <div className="flex items-center gap-2 text-sm"><Keyboard className="w-4 h-4" /><span>{isRecording ? 'Press any key...' : `Key: ${panicKey}`}</span></div>
                    </button>
                  </div>
                )}
                <select onChange={(e) => {
                    const preset = presets[e.target.value];
                    if (preset) {
                      document.title = preset.title;
                      let link = document.querySelector("link[rel*='icon']");
                      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
                      link.href = preset.favicon;
                      localStorage.setItem('cloaked-title', preset.title);
                      localStorage.setItem('cloaked-icon', preset.favicon);
                    }
                }} className="w-full bg-black text-zinc-100 border border-white/10 rounded-xl p-3 text-sm appearance-none cursor-pointer">
                    <option value="none">None (Default)</option>
                    <option value="powerschool">PowerSchool</option>
                    <option value="google">Google Drive</option>
                </select>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {favoriteGamesList.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6"><Heart className="w-5 h-5 text-[#10A5F5] fill-[#10A5F5]" /><h2 className="text-lg font-bold">Your Favorites</h2></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {favoriteGamesList.map(game => <GameCard key={game.id} game={game} />)}
                </AnimatePresence>
            </div>
          </section>
        )}
        <section>
          {favoriteGamesList.length > 0 && (
            <div className="flex items-center gap-2 mb-6 text-zinc-500">
              <Gamepad2 className="w-5 h-5" />
              <h2 className="text-lg font-bold">All Games</h2>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">{otherGamesList.map(game => <GameCard key={game.id} game={game} />)}</AnimatePresence>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 mt-20 text-center opacity-50">
          <span className="text-lg font-bold">Capybara <span className="text-[#10A5F5]">Science</span></span>
          <p className="text-zinc-500 text-sm mt-2">The best place to be when you have free time in class</p>
      </footer>
    </div>
  );
}

export default App;
