export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // This handles the player count logic
    if (url.pathname === "/api/players") {
      try {
        // 1. Get current count from KV
        let count = await env.STATS_KV.get("active_players");
        
        // 2. If it's empty (first time), start at 1248
        if (!count) {
          count = "1248";
        }

        // 3. Add one for the new visitor
        const newCount = parseInt(count) + 1;

        // 4. Save the new number back to the database
        await env.STATS_KV.put("active_players", newCount.toString());

        // 5. Return the JSON for the website to read
        return new Response(JSON.stringify({ count: newCount }), {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          },
        });
      } catch (e) {
        // If there is a database error, show this:
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // CRITICAL: For any other URL (like index.html), serve your website files
    return env.ASSETS.fetch(request);
  },
};
