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
    const email = event.data.customer.email;
    // Store subscriber email in Vercel KV or just log it
    console.log('New subscriber:', email);
    // For now, return success
    return res.status(200).json({ received: true, email });
  }

  res.status(200).json({ received: true });
}
