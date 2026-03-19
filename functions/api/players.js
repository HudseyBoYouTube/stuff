export async function onRequest(context) {
  // This pulls the database connection from your wrangler.toml
  const { STATS_KV } = context.env;

  // 1. Get the current count from your KV storage
  // If it's the very first time, it starts at 157
  let count = await STATS_KV.get("active_players");
  let currentCount = count ? parseInt(count) : 157;

  // 2. The Logic: Add 1 for the new person who just loaded the site
  const finalCount = currentCount + 1;

  // 3. Save the new, higher number back to the database
  await STATS_KV.put("active_players", finalCount.toString());

  // 4. Send the real number back to your React app (App.jsx)
  return new Response(JSON.stringify({ count: finalCount }), {
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*" 
    },
  });
}
