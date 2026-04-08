import { useState, useEffect } from 'react';

export function useAchievements(userData, gamesData) {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (!userData) return;

    const unlocked = [];
    const favs = userData.favs || [];
    const times = userData.times || {};
    const themeCount = userData.themeChanges || 0;

    // 1. First Blood (Play any game)
    if (Object.keys(times).length > 0) unlocked.push('first_game');

    // 2. Marathoner (Total play time > 1 hour)
    const totalMinutes = Object.values(times).reduce((a, b) => a + b, 0) / 60;
    if (totalMinutes >= 60) unlocked.push('marathon');

    // 3. The Collector (10 Favorites)
    if (favs.length >= 10) unlocked.push('collector');

    // 4. Capy-Loyalist (30 mins in one game)
    const hasLoyal = Object.values(times).some(t => t >= 1800); // 1800 seconds = 30 mins
    if (hasLoyal) unlocked.push('loyal');

    // 5. Fashionista (Changed theme 5 times)
    if (themeCount >= 5) unlocked.push('styler');

    setAchievements(unlocked);
  }, [userData]);

  return achievements;
}
