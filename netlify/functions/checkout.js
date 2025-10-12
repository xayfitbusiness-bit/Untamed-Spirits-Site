fetch('/.netlify/functions/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items })
});
// /.netlify/functions/checkout
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const allow = {
  'Access-Control-Allow-Origin': '*',                 // lock down to your domain in production
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS'
};

exports.handler = async (event) => {
  try {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: allow, body: 'OK' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers: allow, body: 'Method Not Allowed' };
    }

    const { items } = JSON.parse(event.body || '{}');
    if (!Array.isArray(items) || !items.length) {
      return { statusCode: 400, headers: allow, body: JSON.stringify({ error: 'No items' }) };
    }

    // Each item must have a Stripe Price ID and quantity
    const line_items = items.map(i => ({
      price: i.price,                  // e.g. "price_1Qabc123..."
      quantity: Number(i.quantity)||1,
      adjustable_quantity: { enabled: true, minimum: 1 }
    })).filter(li => !!li.price);

    if (!line_items.length) {
      return { statusCode: 400, headers: allow, body: JSON.stringify({ error: 'Invalid price IDs' }) };
    }

    const site = process.env.SITE_URL || 'https://example.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      shipping_options: [
        { shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 599, currency: 'usd' },
            display_name: 'Standard (5–7 days)'
          }
        },
        { shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1299, currency: 'usd' },
            display_name: 'Expedited (2–3 days)'
          }
        }
      ],
      allow_promotion_codes: true,
      success_url: `${site}/?success=true`,
      cancel_url:  `${site}/?canceled=true`
    });

    return {
      statusCode: 200,
      headers: { ...allow, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    console.error('checkout error:', err);
    return {
      statusCode: 500,
      headers: allow,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};

