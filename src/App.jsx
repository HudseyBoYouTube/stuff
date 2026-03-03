import { useState, useMemo, useEffect } from 'react';
import { Search, Gamepad2, Play, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gamesData from './games.json';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const presets = {
    none: { title: 'Capybara Science', favicon: '/vite.svg' },
    schoology: { title: 'Home | Schoology', favicon: 'https://asset-cdn.schoology.com/sites/all/themes/schoology_theme/favicon.ico' },
    google: { title: 'Home - Google Drive', favicon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' },
    canvas: { title: 'Dashboard', favicon: 'https://du11hjcvhe07u.cloudfront.net/stable/static/images/favicon.ico' }
  };

  // Load saved cloak on startup
  useEffect(() => {
    const savedTitle = localStorage.getItem('cloaked-title');
    const savedIcon = localStorage.getItem('cloaked-icon');
    if (savedTitle) document.title = savedTitle;
    if (savedIcon) updateFavicon(savedIcon);
  }, []);

  const updateFavicon = (url) => {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
    localStorage.setItem('cloaked-icon', url);
  };

  const handlePresetChange = (e) => {
    const preset = presets[e.target.value];
    if (preset) {
      document.title = preset.title;
      updateFavicon(preset.favicon);
      localStorage.setItem('cloaked-title', preset.title);
    }
  };

  const filteredGames = useMemo(() => {
    return gamesData.filter(game =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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
