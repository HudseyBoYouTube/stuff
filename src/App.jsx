import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Gamepad2, Play, Settings, X, ShieldAlert, 
  Clock, Dices, RotateCcw, Palette, Type, ImageIcon, 
  Link as LinkIcon, Upload, Battery, Calendar, Heart, Trash2, Ghost, Zap, Video, Music, Volume2, Power,
  Cpu, Users, UserPlus, UserCircle, CheckCircle2, History 
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
  canvas: { title: "Dashboard", icon: "https://du11hjcvx0uq_cloudfront_net/dist/images/favicon-e10d657a73.ico" }
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

  // IMPROVED: Logic to ensure background is enabled if assets exist
  const [bgEnabled, setBgEnabled] = useState(() => {
    const saved = localStorage.getItem('capy-bg-enabled');
    if (saved === null) return !!(localStorage.getItem('capy-bg-image') || localStorage.getItem('capy-bg-video'));
    return saved === 'true';
  });

  const [backgroundImage, setBackgroundImage] = useState(() => localStorage.getItem('capy-bg-image') || '');
  const [backgroundVideo, setBackgroundVideo] = useState(() => localStorage.getItem('capy-bg-video') || '');
  const [bgOpacity, setBgOpacity] = useState(() => Number(localStorage.getItem('capy-bg-opacity')) || 50);
  
  const [bgMusic, setBgMusic] = useState(() => localStorage.getItem('capy-bg-music') || '');
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('capy-volume')) || 50);

  const [panicUrl, setPanicUrl] = useState(() => localStorage.getItem('capy-panic-url') || 'https://google.com');
  const [panicKey, setPanicKey] = useState(() => localStorage.getItem('capy-panic-key') || '');

  const [favorites, setFavorites] = useState(() => {
    try {
        const saved = localStorage.getItem('capy-favorites');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });
  
  const [playtimes] = useState(() => JSON.parse(localStorage.getItem('capy-playtimes') || '{}'));

  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const saved = localStorage.getItem('capy-recent');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [performanceMode, setPerformanceMode] = useState(() => localStorage.getItem('capy-perf-mode') === 'true');
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('capy-display-name') || 'CapyUser');
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('capy-pfp') || '');
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
    const data = {
      n: displayName,
      id: uniqueId,
      f: favorites.slice(0, 5),
      t: playtimes,
      p: profilePic 
    };
    return btoa(JSON.stringify(data)).replace(/=/g, '');
  }, [displayName, uniqueId, favorites, playtimes, profilePic]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    updateThemeVariables(theme, performanceMode ? 0 : glowIntensity);
  }, [performanceMode, theme, glowIntensity]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
    localStorage.setItem('capy-volume', volume);
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('capy-bg-opacity', bgOpacity);
  }, [bgOpacity]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
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
        setBgMusic(reader.result);
        localStorage.setItem('capy-bg-music', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePfpUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        localStorage.setItem('capy-pfp', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyTheme = (t) => {
    setTheme(t.color);
    setGlowIntensity(t.glow);
    localStorage.setItem('capy-theme', t.color);
    localStorage.setItem('capy-glow', t.glow);
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

  const categoriesWithCounts = useMemo(() => {
    const uniqueCats = [...new Set(gamesData.map(g => g?.category).filter(Boolean))];
    const final = [{ name: 'All', count: gamesData.length }];
    const favCount = gamesData.filter(g => favorites.includes(g.id)).length;
    if (favCount > 0) final.unshift({ name: 'Favorites', count: favCount });
    uniqueCats.forEach(cat => {
      final.push({ name: cat, count: gamesData.filter(g => g.category === cat).length });
    });
    return final;
  }, [gamesData, favorites]);

  const launchContent = (item) => {
    if (!item?.url) return;
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(id => id !== item.id);
      const updated = [item.id, ...filtered].slice(0, 4);
      localStorage.setItem('capy-recent', JSON.stringify(updated));
      return updated;
    });

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

  const recentGamesData = useMemo(() => {
    return recentlyPlayed.map(id => gamesData.find(g => g.id === id)).filter(Boolean);
  }, [recentlyPlayed, gamesData]);

  return (
    <div className={`min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased relative ${performanceMode ? '' : 'transition-all'}`} style={{ '--theme': theme, '--glow': `${performanceMode ? 0 : glowIntensity}px` }}>
      
      {notification && (
        <div className="fixed bottom-40 left-1/2 -translate-x-1/2 z-[300] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-zinc-900 border border-[var(--theme)]/50 px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[var(--theme)]" />
            <span className="text-xs font-black uppercase tracking-tight">{notification}</span>
          </div>
        </div>
      )}

      {/* FIXED: Background Renderer with enhanced visibility logic */}
      {bgEnabled && !performanceMode && (backgroundImage || backgroundVideo) && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ opacity: bgOpacity / 100 }}>
          {backgroundVideo ? (
            <video key={backgroundVideo} autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src={backgroundVideo} />
            </video>
          ) : (
            <div className="w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})` }} />
          )}
        </div>
      )}

      {bgMusic && <audio ref={audioRef} src={bgMusic} loop />}

      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-white/5 h-16 flex items-center px-4 bg-[#09090b]/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">
            <div className="flex items-center gap-2">
              <img src={DEFAULT_ICON} alt="Logo" className="w-7 h-7 object-contain" />
              <span className="text-xl font-black hidden lg:block tracking-tighter">Capybara <span className="text-[var(--theme)]">Science</span></span>
            </div>

            <div className="flex items-center gap-2 w-full justify-self-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input type="text" placeholder="Search games..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-10 text-xs outline-none focus:border-[var(--theme)]/50" />
              </div>
              <button onClick={() => {
                const playable = gamesData.filter(g => !['request', 'report'].includes(g.id));
                if (playable.length > 0) launchContent(playable[Math.floor(Math.random() * playable.length)]);
              }} className="p-2 bg-white/5 border border-white/10 rounded-full text-[var(--theme)] hover:bg-[var(--theme)] hover:text-black">
                <Dices className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button onClick={() => setShowSettings(true)} className="p-2 text-[var(--theme)] hover:opacity-70"><Settings className="w-6 h-6" /></button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 mt-8 space-y-12">
          {recentGamesData.length > 0 && activeCategory === 'All' && !searchQuery && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <History className="w-3 h-3 text-[var(--theme)]" /> Recently Played
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {recentGamesData.map(game => (
                  <GameCard key={`recent-${game.id}`} game={game} onLaunch={launchContent} isFavorite={favorites.includes(game.id)} onToggleFavorite={() => toggleFavorite(game.id)} performanceMode={performanceMode} />
                ))}
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} onLaunch={launchContent} isFavorite={favorites.includes(game.id)} onToggleFavorite={() => toggleFavorite(game.id)} performanceMode={performanceMode} />
            ))}
          </section>
        </main>
      </div>

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
        profilePic={profilePic}
        handlePfpUpload={handlePfpUpload}
        handleResetPfp={() => { setProfilePic(''); localStorage.removeItem('capy-pfp'); }}
        bgMusic={bgMusic}
        bgEnabled={bgEnabled}
        volume={volume}
        setVolume={setVolume}
        bgOpacity={bgOpacity}
        setBgOpacity={setBgOpacity}
        displayName={displayName}
        setDisplayName={(val) => { setDisplayName(val); localStorage.setItem('capy-display-name', val); }}
        friendCode={friendCode}
        friends={friends}
        onViewFriend={setSelectedFriend}
      />
    </div>
  );
}

export default App;
