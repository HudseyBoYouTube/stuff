import { useState, useMemo, useEffect } from 'react';
import { Search, Gamepad2, Play, Settings, X, ShieldAlert, Keyboard, Heart, Shuffle, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gamesData from './games.json';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [panicUrl, setPanicUrl] = useState(localStorage.getItem('panic-url') || 'https://classroom.google.com');
  const [panicKey, setPanicKey] = useState(localStorage.getItem('panic-key') || 'Escape');
  const [isRecording, setIsRecording] = useState(false);
  const [panicEnabled, setPanicEnabled] = useState(localStorage.getItem('panic-enabled') !== 'false');
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('theme') === 'light');
  
  // New state for Dynamic Cloaking
  const [customCloakUrl, setCustomCloakUrl] = useState(localStorage.getItem('custom-cloak-url') || '');

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorite-games');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const presets = {
    none: { title: 'Capybara Science', favicon: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' },
    powerschool: { title: 'PowerSchool', favicon: 'https://www.powerschool.com/favicon.ico' },
    google: { title: 'My Drive - Google Drive', favicon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' }
  };

  // Helper function for Dynamic Cloaking
  const applyCloak = (url) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      const title = domain.replace('www.', '');
      const icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      
      document.title = title;
      let link = document.querySelector("link[rel*='icon']");
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = icon;

      localStorage.setItem('cloaked-title', title);
      localStorage.setItem('cloaked-icon', icon);
    } catch (e) {
      document.title = 'Capybara Science';
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLightMode);
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  useEffect(() => { localStorage.setItem('favorite-games', JSON.stringify(favorites)); }, [favorites]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!panicEnabled || (e.target.tagName === 'INPUT' && !isRecording)) return;
      if (isRecording) {
        e.preventDefault(); setPanicKey(e.key); localStorage.setItem('panic-key', e.key); setIsRecording(false); return;
      }
      if (e.key === panicKey) window.location.href = panicUrl;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicKey, panicUrl, isRecording, panicEnabled]);

  const handleSelectGame = (game) => {
    const win = window.open('about:blank', '_blank');
    if (!win) return;
    win.document.title = 'DO NOT REFRESH';
    const doc = win.document;
    doc.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
    const iframe = doc.createElement('iframe');
    iframe.src = game.url;
    iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";
    doc.body.appendChild(iframe);
  };

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (gamesData || []).filter(g => g.title?.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q));
  }, [searchQuery]);

  const favs = useMemo(() => filteredGames.filter(g => favorites.includes(g.id)), [filteredGames, favorites]);
  const others = useMemo(() => filteredGames.filter(g => !favorites.includes(g.id)), [filteredGames, favorites]);

  const GameCard = ({ game }) => (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ y: -4 }}
      className="group bg-[var(--card-bg)] border border-white/5 rounded-2xl overflow-hidden cursor-pointer" onClick={() => handleSelectGame(game)}>
      <div className="aspect-[4/3] bg-zinc-800/20 flex items-center justify-center relative overflow-hidden">
        <img src={game.thumbnail} alt={game.title} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <button onClick={(e) => { e.stopPropagation(); setFavorites(p => p.includes(game.id) ? p.filter(id => id !== game.id) : [...p, game.id]); }} 
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          <Heart className={`w-4 h-4 ${favorites.includes(game.id) ? 'fill-[#10A5F5] text-[#10A5F5]' : 'text-white'}`} />
        </button>
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-[#10A5F5] rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <Play className="w-6 h-6 text-black fill-current" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-[var(--text-main)] group-hover:text-[#10A5F5] truncate">{game.title}</h3>
          <span className="text-[10px] font-bold uppercase text-[#10A5F5] px-2 py-0.5 bg-[#10A5F5]/10 rounded-md shrink-0">{game.category}</span>
        </div>
        <p className="text-xs text-zinc-500">{['request', 'report'].includes(game.id) ? 'Click to fill out' : 'Click to play'}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pb-20">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[var(--bg-main)]/80 backdrop-blur-xl h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10A5F5] rounded-lg flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-black" /></div>
            <span className="text-xl font-bold hidden sm:block">Capybara <span className="text-[#10A5F5]">Science</span></span>
          </div>
          <div className="flex-1 max-w-md mx-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="text" placeholder="Search games..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-10 text-sm outline-none focus:border-[#10A5F5]/50" />
            {searchQuery && <X onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 cursor-pointer text-zinc-500" />}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsLightMode(!isLightMode)} className="p-2 text-zinc-400 hover:text-[#10A5F5]">{isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}</button>
            <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-400 hover:text-[#10A5F5]"><Settings className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-black border border-white/10 p-6 rounded-2xl max-w-sm w-full relative shadow-2xl">
              <X onClick={() => setShowSettings(false)} className="absolute top-4 right-4 cursor-pointer text-zinc-500" />
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-[#10A5F5]" /> Settings</h2>
              <div className="space-y-4 text-white">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-sm">Panic Key</span>
                  <button onClick={() => setPanicEnabled(!panicEnabled)} className={`w-10 h-5 rounded-full relative ${panicEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${panicEnabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                {panicEnabled && (
                  <>
                    <input type="text" value={panicUrl} onChange={(e) => {setPanicUrl(e.target.value); localStorage.setItem('panic-url', e.target.value);}} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm outline-none" />
                    <button onClick={() => setIsRecording(true)} className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-sm">{isRecording ? 'Press a key...' : `Key: ${panicKey}`}</button>
                  </>
                )}

                {/* Custom URL Cloaking Section */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Custom URL Cloak</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. wikipedia.org" 
                      value={customCloakUrl}
                      onChange={(e) => setCustomCloakUrl(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-xl p-2 text-xs outline-none focus:border-[#10A5F5]"
                    />
                    <button 
                      onClick={() => {
                        applyCloak(customCloakUrl);
                        localStorage.setItem('custom-cloak-url', customCloakUrl);
                      }}
                      className="px-3 bg-[#10A5F5] text-black font-bold rounded-xl text-xs hover:bg-[#0d8bc0]"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <select onChange={(e) => {
                  const p = presets[e.target.value];
                  if(p){ 
                    document.title=p.title; 
                    let l=document.querySelector("link[rel*='icon']"); 
                    if(!l){l=document.createElement('link');l.rel='icon';document.head.appendChild(l);} 
                    l.href=p.favicon; 
                  }
                }} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm outline-none">
                  <option value="none">Presets (Default Title)</option>
                  <option value="powerschool">PowerSchool</option>
                  <option value="google">Google Drive</option>
                </select>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {favs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6"><Heart className="w-5 h-5 text-[#10A5F5] fill-[#10A5F5]" /><h2 className="text-lg font-bold">Favorites</h2></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><AnimatePresence mode="popLayout">{favs.map(g => <GameCard key={g.id} game={g} />)}</AnimatePresence></div>
          </section>
        )}
        <section>
          {favs.length > 0 && <div className="flex items-center gap-2 mb-6 text-zinc-500"><Gamepad2 className="w-5 h-5" /><h2 className="text-lg font-bold">All Games</h2></div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><AnimatePresence mode="popLayout">{others.map(g => <GameCard key={g.id} game={g} />)}</AnimatePresence></div>
        </section>
      </main>
    </div>
  );
}

export default App;
