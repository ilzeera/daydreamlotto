export default async function handler(req, res) {
  const email = (req.query.email||'').toLowerCase();
  if (!email) return res.json({ active: false });
 
  const r = await fetch(
    `${process.env.KV_REST_API_URL}/get/sub:${email}`,
    { headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }}
  );
  const data = await r.json();
  res.json({ active: data.result === '1' });
}
