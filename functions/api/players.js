export async function onRequest(context) {
  const { STATS_KV } = context.env;
  
  // 1. Get current count (starts at 1248 if empty)
  let count = await STATS_KV.get("active_players");
  if (!count) count = 1248;

  // 2. Add one for the new visitor
  const newCount = parseInt(count) + 1;

  // 3. Save it back to the database
  await STATS_KV.put("active_players", newCount.toString());

  // 4. Return the new number to the website
  return new Response(JSON.stringify({ count: newCount }), {
    headers: { "Content-Type": "application/json" }
  });
}
