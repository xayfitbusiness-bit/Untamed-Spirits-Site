fetch('/api/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ items }) })
// Netlify Function: /.netlify/functions/checkout
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { items } = JSON.parse(event.body || '{}');
    if (!Array.isArray(items) || !items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No items' }) };
    }

    // Build line_items
    const line_items = items.map(i => ({
      price: i.price,            // a Stripe Price ID (price_xxx)
      quantity: i.quantity || 1, // default 1
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      // collect shipping address
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      // simple shipping options
      shipping_options: [
        { shipping_rate_data: {
            display_name: 'Standard (5–7 days)',
            type: 'fixed_amount',
            fixed_amount: { amount: 599, currency: 'usd' }
        }},
        { shipping_rate_data: {
            display_name: 'Expedited (2–3 days)',
            type: 'fixed_amount',
            fixed_amount: { amount: 1299, currency: 'usd' }
        }},
      ],
      // where Stripe sends user after success/cancel
      success_url: `${process.env.SITE_URL || 'https://yourdomain.com'}/?success=true`,
      cancel_url:  `${process.env.SITE_URL || 'https://yourdomain.com'}/?canceled=true`,
      allow_promotion_codes: true,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
