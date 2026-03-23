import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CheckCircle2, History 
} from 'lucide-react';

import gamesDataRaw from './games.json';
import { GameCard } from './components/GameCard';
import { SettingsModal } from './components/SettingsModal';
import { Header } from './components/Header';
import { FriendViewModal } from './components/FriendViewModal';

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

  // Persistence State
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
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('capy-volume')) || 50);
  const [panicUrl, setPanicUrl] = useState(() => localStorage.getItem('capy-panic-url') || 'https://google.com');
  const [panicKey, setPanicKey] = useState(() => localStorage.getItem('capy-panic-key') || '');
  const [performanceMode, setPerformanceMode] = useState(() => localStorage.getItem('capy-perf-mode') === 'true');
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('capy-display-name') || 'CapyUser');
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('capy-pfp') || '');
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // JSON Parsed State with Error Handling
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('capy-favorites')) || []; } 
    catch { return []; }
  });
  
  const [playtimes, setPlaytimes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('capy-playtimes')) || {}; } 
    catch { return {}; }
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('capy-recent')) || []; } 
    catch { return []; }
  });

  const [friends, setFriends] = useState(() => {
    try { return JSON.parse(localStorage.getItem('capy-friends')) || []; } 
    catch { return []; }
  });

  const [uniqueId] = useState(() => {
    let id = localStorage.getItem('capy-unique-id');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID().substring(0, 8) : Math.random().toString(36).substring(2, 10);
      localStorage.setItem('capy-unique-id', id);
    }
    return id;
  });

  // Theme & UI Effects
  useEffect(() => {
    updateThemeVariables(theme, performanceMode ? 0 : glowIntensity);
  }, [performanceMode, theme, glowIntensity]);

  useEffect(() => {
    const currentIdentity = disguise !== 'none' 
      ? DISGUISE_CONFIG[disguise] 
      : { title: customTitle || DEFAULT_TITLE, icon: customIcon || DEFAULT_ICON };

    document.title = currentIdentity.title;
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = currentIdentity.icon;
  }, [disguise, customTitle, customIcon]);

  // Panic Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (panicKey && e.key === panicKey) {
        window.location.href = panicUrl.startsWith('http') ? panicUrl : `https://${panicUrl}`;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicUrl, panicKey]);

  // System Info
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

  // Handlers
  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id];
      localStorage.setItem('capy-favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const launchContent = (item) => {
    if (!item?.url) return;
    const startTime = Date.now();
    
    setRecentlyPlayed(prev => {
      const updated = [item.id, ...prev.filter(id => id !== item.id)].slice(0, 4);
      localStorage.setItem('capy-recent', JSON.stringify(updated));
      return updated;
    });

    const win = window.open('about:blank', '_blank');
    if (win) {
      const icon = disguise !== 'none' ? DISGUISE_CONFIG[disguise].icon : (customIcon || DEFAULT_ICON);
      win.document.write(`
        <html>
          <head>
            <title>Loading...</title>
            <link rel="icon" href="${icon}">
            <style>body{margin:0;overflow:hidden;background:#000;}iframe{width:100vw;height:100vh;border:none;}</style>
          </head>
          <body><iframe src="${item.url}" allow="fullscreen"></iframe></body>
        </html>
      `);
      win.document.close();

      const track = setInterval(() => {
        if (win.closed) {
          clearInterval(track);
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setPlaytimes(prev => {
            const updated = { ...prev, [item.id]: (prev[item.id] || 0) + elapsed };
            localStorage.setItem('capy-playtimes', JSON.stringify(updated));
            return updated;
          });
        }
      }, 1000);
    }
  };

  const filteredGames = useMemo(() => {
    return gamesData.filter(g => {
      const matchesSearch = g.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' 
        ? true 
        : activeCategory === 'Favorites' ? favorites.includes(g.id) : g.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, gamesData, favorites]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20 antialiased relative" style={{ '--theme': theme }}>
      {/* Background Layer */}
      {bgEnabled && !performanceMode && (
        <div className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: bgOpacity / 100 }}>
          {backgroundVideo ? (
            <video autoPlay muted loop playsInline className="w-full h-full object-cover"><source src={backgroundVideo} /></video>
          ) : (
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
          )}
        </div>
      )}

      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-zinc-900 border border-[var(--theme)] px-6 py-3 rounded-full flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--theme)]" />
          <span className="text-xs font-bold uppercase">{notification}</span>
        </div>
      )}

      <div className="relative z-10">
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          time={time}
          battery={battery}
          profilePic={profilePic}
          setShowSettings={setShowSettings}
          onRandomGame={() => {
            const playable = gamesData.filter(g => g.url);
            if (playable.length) launchContent(playable[Math.floor(Math.random() * playable.length)]);
          }}
        />

        <main className="max-w-7xl mx-auto px-4 mt-8 space-y-12">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredGames.map(game => (
              <GameCard 
                key={game.id} 
                game={game} 
                onLaunch={launchContent} 
                isFavorite={favorites.includes(game.id)}
                onToggleFavorite={() => toggleFavorite(game.id)}
                playtime={playtimes[game.id] ? `${Math.floor(playtimes[game.id]/60)}m` : '0m'}
              />
            ))}
          </section>
        </main>
      </div>

      <SettingsModal 
        show={showSettings} 
        onClose={() => setShowSettings(false)}
        {...{theme, setTheme, glowIntensity, setGlowIntensity, disguise, setDisguise, customTitle, setCustomTitle, customIcon, setCustomIcon, performanceMode, setPerformanceMode}}
        // ... pass other necessary props here
      />
    </div>
  );
}

export default App;
