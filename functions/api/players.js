export async function onRequest(context) {
  // Use the binding you created in the dashboard/wrangler.toml
  const { STATS_KV } = context.env;

  // 1. Get the current count from your KV storage
  let count = await STATS_KV.get("active_players");
  
  // If it's the first time, start at a realistic number like 157
  let currentCount = count ? parseInt(count) : 157;

  // 2. Add a tiny bit of "natural" movement (-3 to +3 players)
  const fluctuation = Math.floor(Math.random() * 7) - 3; 
  const finalCount = Math.max(140, currentCount + fluctuation);

  // 3. Save the new number back to the database
  await STATS_KV.put("active_players", finalCount.toString());

  // 4. Send the number back to your React app
  return new Response(JSON.stringify({ count: finalCount }), {
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*" 
    },
  });
}
