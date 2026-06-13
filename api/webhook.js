export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const crypto = require('crypto');
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;

  if (event.event === 'subscription.create' ||
      event.event === 'charge.success') {
    const email = event.data.customer.email.toLowerCase();
   
    // Store in Upstash Redis
    await fetch(`${process.env.KV_REST_API_URL}/set/sub:${email}/1`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
    });
  }

  res.status(200).json({ received: true });
}
