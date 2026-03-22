import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  Clock, Dices, RotateCcw, Palette, Type, ImageIcon, 
  Link as LinkIcon, Upload, Battery, Calendar, Heart, Trash2, Ghost, Zap, Video, Music, Volume2, Power,
  Cpu, Users, UserPlus, UserCircle, CheckCircle2
} from 'lucide-react';

import gamesDataRaw from './games.json';
import { GameCard } from './components/GameCard';
import { SettingsModal } from './components/SettingsModal';

const DEFAULT_COLOR = '#10A5F5';
const DEFAULT_GLOW = 50;
const DEFAULT_TITLE = "Capybara Science";
const DEFAULT_ICON = "https://img.icons8.com/color/32/capybara.png";

const THEMES = {
  cyber: { name: 'Cyberpunk', color: '#ff0055', glow: 60 },
  midnight: { name: 'Midnight', color: '#7c3aed', glow: 40 },
  forest: { name: 'Forest', color: '#10b981', glow: 30 },
  classic: { name: 'Classic', color: DEFAULT_COLOR, glow: DEFAULT_GLOW }
};

const DISGUISE_CONFIG = {
  none: { title: DEFAULT_TITLE, icon: DEFAULT_ICON },
  drive: { title: "My Drive - Google Drive", icon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png" },
  classroom: { title: "Home - Classroom", icon: "https://www.gstatic.com/classroom/favicon.png" },
  canvas: { title: "Dashboard", icon: "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico" }
};

const updateThemeVariables = (color, glow) => {
  const root = document.documentElement;
  root.style.setProperty('--theme', color);
  root.style.setProperty('--glow', `${glow}px`);
};

function App() {
  const gamesData = useMemo(() => {
    if (!gamesDataRaw || !Array.isArray(gamesDataRaw)) return [];
    return gamesDataRaw;
  }, []);

  const audioRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClearSettings, setConfirmClearSettings] = useState(false);
  const [notification, setNotification] = useState(null);

  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState({ level: 100, charging: false });

  const [theme, setTheme] = useState(() => localStorage.getItem('capy-theme') || DEFAULT_COLOR);
  const [glowIntensity, setGlowIntensity] = useState(() => Number(localStorage.getItem('capy-glow')) || DEFAULT_GLOW);
  const [disguise, setDisguise] = useState(() => localStorage.getItem('capy-stealth-type') || 'none');
  const [customTitle, setCustomTitle] = useState(() => localStorage.getItem('capy-custom-title') || '');
  const [customIcon, setCustomIcon] = useState(() => localStorage.getItem('capy-custom-icon') || '');

  const [bgEnabled, setBgEnabled] = useState(() => localStorage.getItem('capy-bg-enabled') === 'true');
  const [backgroundImage, setBackgroundImage] = useState(() => localStorage.getItem('capy-bg-image') || '');
  const [backgroundVideo, setBackgroundVideo] = useState(() => localStorage.getItem('capy-bg-video') || '');
  const [bgOpacity, setBgOpacity] = useState(() => Number(localStorage.getItem('capy-bg-opacity')) || 50);
  
  const [bgMusic, setBgMusic] = useState(() => localStorage.getItem('capy-bg-music') || '');
  const [musicEnabled, setMusicEnabled] = useState(true); 
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('capy-volume')) || 50);

  const [panicUrl, setPanicUrl] = useState(() => localStorage.getItem('capy-panic-url') || 'https://google.com');
  const [panicKey, setPanicKey] = useState(() => localStorage.getItem('capy-panic-key') || '');

  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('capy-favorites') || '[]'));
  const [playtimes] = useState(() => JSON.parse(localStorage.getItem('capy-playtimes') || '{}'));

  const [performanceMode, setPerformanceMode] = useState(() => localStorage.getItem('capy-perf-mode') === 'true');

  // SOCIAL FEATURES STATE
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('capy-display-name') || 'CapyUser');
  const [friends, setFriends] = useState(() => JSON.parse(localStorage.getItem('capy-friends') || '[]'));
  const [selectedFriend, setSelectedFriend] = useState(null);

  const [uniqueId] = useState(() => {
    let id = localStorage.getItem('capy-unique-id');
    if (!id) {
      id = typeof crypto.randomUUID === 'function' 
        ? crypto.randomUUID().substring(0, 8) 
        : Math.random().toString(36).substring(2, 10);
      localStorage.setItem('capy-unique-id', id);
    }
    return id;
  });

  const friendCode = useMemo(() => {
    const combined = `${displayName}#${uniqueId}`;
    return btoa(combined).replace(/=/g, '');
  }, [displayName, uniqueId]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (performanceMode) {
      setBgEnabled(false);
      setMusicEnabled(false);
      updateThemeVariables(theme, 0); 
    } else {
      updateThemeVariables(theme, glowIntensity);
    }
  }, [performanceMode, theme, glowIntensity]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      localStorage.setItem('capy-volume', volume);
    }
  }, [volume]);

  useEffect(() => {
    if (bgMusic && audioRef.current && !performanceMode) {
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.log("Autoplay prevented. Music will start on next click.");
        });
      }
    }
  }, [bgMusic, performanceMode]);

  useEffect(() => {
    const startMusic = () => {
      if (audioRef.current && bgMusic && !performanceMode) {
        audioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('click', startMusic, { once: true });
    return () => window.removeEventListener('click', startMusic);
  }, [bgMusic, performanceMode]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (audioRef.current && bgMusic && !performanceMode) {
        if (document.hidden) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [bgMusic, performanceMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      if (panicKey && e.key === panicKey) {
        window.location.href = panicUrl.startsWith('http') ? panicUrl : `https://${panicUrl}`;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicUrl, panicKey]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    if ('getBattery' in navigator) {
      navigator.getBattery().then(bat => {
        const updateBat = () => setBattery({ level: Math.round(bat.level * 100), charging: bat.charging });
        bat.addEventListener('levelchange', updateBat);
        bat.addEventListener('chargingchange', updateBat);
        updateBat();
      });
    }
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (confirmReset) {
      const timeout = setTimeout(() => setConfirmReset(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [confirmReset]);

  useEffect(() => {
    if (confirmClearSettings) {
      const timeout = setTimeout(() => setConfirmClearSettings(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [confirmClearSettings]);

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setBgEnabled(true);
        localStorage.setItem('capy-bg-enabled', 'true');
        if (file.type.startsWith('video/')) {
          setBackgroundVideo(base64String);
          setBackgroundImage('');
          localStorage.setItem('capy-bg-video', base64String);
          localStorage.removeItem('capy-bg-image');
        } else {
          setBackgroundImage(base64String);
          setBackgroundVideo('');
          localStorage.setItem('capy-bg-image', base64String);
          localStorage.removeItem('capy-bg-video');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBackground = () => {
    setBackgroundImage('');
    setBackgroundVideo('');
    setBgEnabled(false);
    localStorage.removeItem('capy-bg-image');
    localStorage.removeItem('capy-bg-video');
    localStorage.setItem('capy-bg-enabled', 'false');
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setBgMusic(base64String);
        localStorage.setItem('capy-bg-music', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetMusic = () => {
    setBgMusic('');
    localStorage.removeItem('capy-bg-music');
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleFavorite = (id) => {
    const isRemoving = favorites.includes(id);
    const newFavs = isRemoving 
      ? favorites.filter(favId => favId !== id) 
      : [...favorites, id];
    
    setFavorites(newFavs);
    localStorage.setItem('capy-favorites', JSON.stringify(newFavs));

    if (isRemoving && newFavs.length === 0 && activeCategory === 'Favorites') {
        setActiveCategory('All');
    }
  };

  const applyTheme = (t) => {
    setTheme(t.color);
    setGlowIntensity(t.glow);
    localStorage.setItem('capy-theme', t.color);
    localStorage.setItem('capy-glow', t.glow);
    if (!performanceMode) {
        updateThemeVariables(t.color, t.glow);
    }
  };

  const handleReset = () => {
    if (confirmReset) {
      localStorage.clear();
      window.location.reload();
    } else {
      setConfirmReset(true);
    }
  };

  const handleClearSettings = () => {
    if (confirmClearSettings) {
      const settingsKeys = [
        'capy-theme', 'capy-glow', 'capy-stealth-type', 
        'capy-custom-title', 'capy-custom-icon', 'capy-bg-image', 
        'capy-bg-video', 'capy-bg-opacity', 'capy-bg-music', 
        'capy-volume', 'capy-panic-url', 'capy-panic-key', 'capy-perf-mode',
        'capy-bg-enabled', 'capy-display-name', 'capy-friends', 'capy-unique-id'
      ];
      settingsKeys.forEach(key => localStorage.removeItem(key));
      window.location.reload();
    } else {
      setConfirmClearSettings(true);
    }
  };

  const currentIdentity = useMemo(() => {
    if (disguise !== 'none') return DISGUISE_CONFIG[disguise] || DISGUISE_CONFIG.none;
    return { title: customTitle || DEFAULT_TITLE, icon: customIcon || DEFAULT_ICON };
  }, [disguise, customTitle, customIcon]);

  useEffect(() => {
    document.title = currentIdentity.title;
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = currentIdentity.icon;
  }, [currentIdentity]);

  const validFavoritesCount = useMemo(() => gamesData.filter(g => favorites.includes(g.id)).length, [gamesData, favorites]);

  const categoriesWithCounts = useMemo(() => {
    const uniqueCats = [...new Set(gamesData.map(g => g?.category).filter(Boolean))];
    const final = [{ name: 'All', count: gamesData.length }];
    if (validFavoritesCount > 0) final.unshift({ name: 'Favorites', count: validFavoritesCount });
    uniqueCats.forEach(cat => {
      final.push({ name: cat, count: gamesData.filter(g => g.category === cat).length });
    });
    return final;
  }, [gamesData, validFavoritesCount]);

  const launchContent = (item) => {
    if (!item?.url) return;
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.title = "DO NOT REFRESH";
      const link = win.document.createElement('link');
      link.rel = 'icon'; link.href = currentIdentity.icon;
      win.document.head.appendChild(link);
      win.document.body.style = 'margin:0;padding:0;overflow:hidden;background:#000;';
      const iframe = win.document.createElement('iframe');
      iframe.src = item.url;
      iframe.style = 'width:100vw;height:100vh;border:none;display:block;';
      iframe.allow = "fullscreen";
      win.document.body.appendChild(iframe);
    }
  };

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return gamesData.filter(g => {
      const matchesSearch = g?.title?.toLowerCase().includes(q);
      if (activeCategory === 'Favorites') return favorites.includes(g.id) && matchesSearch;
      const matchesCategory = activeCategory === 'All' || g?.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, gamesData, favorites]);

  return (
    <div className={`min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased relative ${performanceMode ? '' : 'transition-all'}`} style={{ '--theme': theme, '--glow': `${performanceMode ? 0 : glowIntensity}px` }}>
      
      {notification && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-zinc-900 border border-[var(--theme)]/50 px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[var(--theme)]" />
            <span className="text-xs font-black uppercase tracking-tight">{notification}</span>
          </div>
        </div>
      )}

      {bgEnabled && !performanceMode && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ opacity: bgOpacity / 100 }}>
          {backgroundVideo ? (
            <video key={backgroundVideo} autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src={backgroundVideo} />
            </video>
          ) : backgroundImage ? (
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
          ) : null}
        </div>
      )}

      {bgMusic && <audio ref={audioRef} src={bgMusic} loop />}

      <div className="relative z-10">
        <div className="sticky top-0 z-50">
          <header className="border-b border-white/5 h-16 flex items-center px-4 bg-[#09090b]/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
              <div className="flex items-center gap-2">
                <img src={DEFAULT_ICON} alt="Logo" className="w-7 h-7 object-contain" />
                <span className="text-xl font-black hidden lg:block tracking-tighter">Capybara <span className="text-[var(--theme)]">Science</span></span>
              </div>

              <div className="flex items-center gap-2 w-full justify-self-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type="text" 
                    placeholder="Search games..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-10 text-xs outline-none focus:border-[var(--theme)]/50 transition-colors" 
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-full text-[var(--theme)]">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button onClick={() => {
                  const playable = gamesData.filter(g => !['request', 'report'].includes(g.id));
                  if (playable.length > 0) launchContent(playable[Math.floor(Math.random() * playable.length)]);
                }} className="p-2 bg-white/5 border border-white/10 rounded-full text-[var(--theme)] hover:bg-[var(--theme)] hover:text-black transition-all">
                  <Dices className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-4">
                <div className="hidden sm:flex items-center gap-3 text-[9px] font-black uppercase text-[var(--theme)] bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                  <div className="flex items-center gap-1 border-l border-white/10 pl-3">
                    <Battery className={`w-3 h-3 ${battery.charging ? 'text-green-500' : ''}`} />
                    <span>{battery.level}%</span>
                  </div>
                </div>
                <button onClick={() => setShowSettings(true)} className="p-2 text-[var(--theme)] hover:opacity-70 transition-all"><Settings className="w-6 h-6" /></button>
              </div>
            </div>
          </header>

          <div className="bg-[#09090b]/90 backdrop-blur-md border-b border-white/5 px-4 pt-1.5 overflow-hidden">
            <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {categoriesWithCounts.map(cat => (
                <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border shrink-0 transition-all ${activeCategory === cat.name ? 'bg-[var(--theme)] border-[var(--theme)] text-black' : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'}`}>
                  {cat.name} <span className="opacity-40 ml-1">{cat.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredGames.map(game => (
            <GameCard 
              key={game.id} 
              game={game} 
              onLaunch={launchContent} 
              playtime={playtimes[game.id] ? Math.floor(playtimes[game.id]/60) + 'm' : '0m'}
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={() => toggleFavorite(game.id)}
              performanceMode={performanceMode}
            />
          ))}
        </main>
      </div>

      {/* FRIEND PROFILE MODAL */}
      {selectedFriend && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-zinc-900 border border-[var(--theme)]/30 p-8 rounded-3xl max-w-sm w-full relative shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6">
            <button onClick={() => setSelectedFriend(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X /></button>
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-[var(--theme)]/10 rounded-full mx-auto flex items-center justify-center border border-[var(--theme)]/20">
                <UserCircle className="w-12 h-12 text-[var(--theme)]" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter uppercase">{selectedFriend.name}</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Capy-Friend Profile</p>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[var(--theme)] uppercase tracking-widest flex items-center gap-2"><Heart className="w-3 h-3" /> Favorite Games</label>
              <div className="grid gap-2">
                {(() => {
                   // Logic check: Is this profile actually ME? 
                   const isMe = selectedFriend.code === friendCode;
                   const displayFavs = isMe ? favorites : selectedFriend.favs;
                   const displayTimes = isMe ? playtimes : selectedFriend.times;

                   return displayFavs.length > 0 ? displayFavs.map(gameId => {
                     const game = gamesData.find(g => g.id === gameId);
                     return game ? (
                       <div key={gameId} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                         <span className="text-xs font-bold">{game.title}</span>
                         <span className="text-[10px] font-mono text-zinc-500">{displayTimes[gameId] ? Math.floor(displayTimes[gameId]/60) : 0}m played</span>
                       </div>
                     ) : null;
                   }) : <p className="text-xs text-zinc-600 text-center py-4 italic">No favorites yet...</p>
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <SettingsModal 
        show={showSettings} 
        onClose={() => setShowSettings(false)}
        performanceMode={performanceMode}
        setPerformanceMode={(val) => { setPerformanceMode(val); localStorage.setItem('capy-perf-mode', val); }}
        themes={THEMES}
        applyTheme={applyTheme}
        panicKey={panicKey}
        setPanicKey={(val) => { setPanicKey(val); localStorage.setItem('capy-panic-key', val); }}
        handleBackgroundUpload={handleBackgroundUpload}
        handleResetBackground={handleResetBackground}
        handleAudioUpload={handleAudioUpload}
        handleResetMusic={handleResetMusic}
        handleClearSettings={handleClearSettings}
        handleReset={handleReset}
        confirmReset={confirmReset}
        confirmClearSettings={confirmClearSettings}
        bgMusic={bgMusic}
        volume={volume}
        setVolume={setVolume}
        displayName={displayName}
        setDisplayName={(val) => { setDisplayName(val); localStorage.setItem('capy-display-name', val); }}
        friendCode={friendCode}
        friends={friends}
        onAddFriend={(code) => {
          try {
            const cleanCode = code.trim();
            if (!cleanCode) return;
            const decoded = atob(cleanCode);
            const name = decoded.split('#')[0];
            if (!name || !decoded.includes('#')) {
              alert("Invalid Friend Code Format!");
              return;
            }
            if (friends.find(f => f.code === cleanCode)) {
              setNotification("Already Friends!");
              return;
            }
            const newFriends = [...friends, { name, code: cleanCode, favs: [], times: {} }];
            setFriends(newFriends);
            localStorage.setItem('capy-friends', JSON.stringify(newFriends));
            setNotification("Friend Added!");
          } catch(e) { 
            alert("Invalid Friend Code!"); 
          }
        }}
        onRemoveFriend={(code) => {
          const newFriends = friends.filter(f => f.code !== code);
          setFriends(newFriends);
          localStorage.setItem('capy-friends', JSON.stringify(newFriends));
        }}
        onViewFriend={setSelectedFriend}
      />
    </div>
  );
}

export default App;
