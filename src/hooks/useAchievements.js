import { useState, useEffect } from 'react';

export function useAchievements(userData) {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (!userData) return;
    
    const unlocked = [];
    
    if (userData.times && Object.keys(userData.times).length > 0) {
      unlocked.push({
        id: 'first_game',
        title: 'Getting Started',
        description: 'Play your first game!'
      });
    }

    if (userData.themeChanges >= 5) {
      unlocked.push({
        id: 'styler',
        title: 'Fashionista',
        description: 'Change the theme 5 times!'
      });
    }

    setAchievements(unlocked);
  }, [userData]);

  return achievements;
}
