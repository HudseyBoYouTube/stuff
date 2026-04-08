import { useState, useEffect } from 'react';

export function useAchievements(userData) {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (!userData) return;
    const unlocked = [];
    
    // Check for "First Blood"
    if (userData.times && Object.keys(userData.times).length > 0) {
      unlocked.push('first_game');
    }

    // Check for "Fashionista"
    if (userData.themeChanges >= 5) {
      unlocked.push('styler');
    }

    // Check for "The Collector"
    if (userData.favs && userData.favs.length >= 10) {
      unlocked.push('collector');
    }

    setAchievements(unlocked);
  }, [userData]);

  return achievements;
}
