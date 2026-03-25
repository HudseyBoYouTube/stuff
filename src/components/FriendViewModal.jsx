import { X, UserCircle, Heart } from 'lucide-react';

export function FriendViewModal({ friend, gamesData, onClose, ownPfp, isOwnProfile }) {
  // FIXED GUARD: Allow the modal to show if it's your own profile, even if 'friend' is null
  if (!isOwnProfile && (!friend || !friend.decoded)) return null;

  // Decide which data to use based on if it's "Me" or a "Friend"
  // If isOwnProfile is true, we strictly use your local state
  const displayPfp = isOwnProfile ? ownPfp : friend?.decoded?.p;
  const displayName = isOwnProfile ? "You" : (friend?.decoded?.n || friend?.name);
  const displayFavs = isOwnProfile ? (friend?.favs || []) : (friend?.decoded?.f || []);
  const displayTimes = isOwnProfile ? (friend?.times || {}) : (friend?.decoded?.t || {});

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-zinc-900 border border-[var(--theme)]/30 p-8 rounded-3xl max-w-sm w-full relative shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6 flex flex-col max-h-[90vh] overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X />
        </button>
        
        {/* Main Wrapper to allow the WHOLE modal to scroll if needed */}
        <div className="overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          <div className="text-center space-y-2">
            {/* Container for the Profile Pic/GIF */}
            <div className="w-24 h-24 bg-[var(--theme)]/10 rounded-full mx-auto flex items-center justify-center border border-[var(--theme)]/20 overflow-hidden shadow-[0_0_20px_rgba(var(--theme-rgb),0.1)]">
              {displayPfp ? (
                <img 
                  src={displayPfp} 
                  alt={displayName} 
                  className="w-full h-full object-cover"
                  key={displayPfp.substring(0, 20)} 
                />
              ) : (
                <UserCircle className="w-14 h-14 text-[var(--theme)]" />
              )}
            </div>
            
            <h3 className="text-2xl font-black tracking-tighter">
              {displayName}
            </h3>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              {isOwnProfile ? "Your Profile" : "Friend Profile"}
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-[var(--theme)] uppercase tracking-widest flex items-center gap-2">
              <Heart className="w-3 h-3" /> Favorite Games
            </label>
            {/* REMOVED no-scrollbar here so the bar appears */}
            <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
              {(() => {
                const validFavs = displayFavs.filter(id => gamesData.find(g => g.id === id));

                return (validFavs.length > 0) ? validFavs.map(gameId => {
                  const game = gamesData.find(g => g.id === gameId);
                  return game ? (
                    <div key={gameId} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-xs font-bold">{game.title}</span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {displayTimes[gameId] ? Math.floor(displayTimes[gameId]/60) : 0}m played
                      </span>
                    </div>
                  ) : null;
                }) : (
                  <p className="text-xs text-zinc-600 text-center py-4 italic">
                    No favorites yet...
                  </p>
                );
              })()}
            </div>
          </div>

          {/* ADDED BACK the Friend Code section from your screenshot */}
          {isOwnProfile && friend?.code && (
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Your Friend Code</label>
              <div className="bg-black/40 border border-white/10 rounded-xl p-3 max-h-32 overflow-y-auto custom-scrollbar">
                {/* break-all and whitespace-pre-wrap FORCES the vertical scroll bar to appear */}
                <p className="text-[9px] font-mono text-blue-400 break-all whitespace-pre-wrap leading-tight">
                  {friend.code}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
