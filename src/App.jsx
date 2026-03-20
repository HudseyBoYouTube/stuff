import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  Keyboard, Heart, Shuffle, Sun, Moon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gamesData from './games.json';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [panicUrl, setPanicUrl] = useState(localStorage.getItem('panic-url') || 'https://classroom.google.com');
  const [panicKey, setPanicKey] = useState(localStorage.getItem('panic-key') || 'Escape');
  const [isRecording, setIsRecording] = useState(false);
  const [panicEnabled, setPanicEnabled] = useState(localStorage.getItem('panic-enabled') !== 'false');
  
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorite-games');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const presets = {
    none: { title: 'Capybara Science', favicon: 'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg' },
    powerschool: { title: 'PowerSchool', favicon: 'https://www.powerschool.com/favicon.ico' },
    google: { title: 'My Drive - Google Drive', favicon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' }
  };

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  useEffect(() => {
    localStorage.setItem('favorite-games', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!panicEnabled) return;
      if (e.target.tagName === 'INPUT' && !isRecording) return;
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
    const playableGames = (gamesData || []).filter(game => 
      game.id && !['request', 'report'].includes(game.id.toLowerCase())
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
    if (!Array.isArray(gamesData)) return [];
    const query = searchQuery.toLowerCase();
    return gamesData.filter(game =>
      game.title?.toLowerCase().includes(query) ||
      game.category?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const favoriteGamesList = useMemo(() => filteredGames.filter(g => favorites.includes(g.id)), [filteredGames, favorites]);
  const otherGamesList = useMemo(() => filteredGames.filter(g => !favorites.includes(g.id)), [filteredGames, favorites]);

  const GameCard = ({ game }) => (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} whileHover={{ y: -4 }}
      className="group relative bg-[var(--card-bg)] border border-white/5 rounded-2xl overflow-hidden cursor-pointer" onClick={() => handleSelectGame(game)}>
      <div className={`aspect-[4/3] overflow-hidden bg-zinc-800/20 flex items-center justify-center relative ${
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
          <h3 className="font-semibold text-[var(--text-main)] group-hover:text-[#10A5F5] transition-colors">{game.title}</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1
