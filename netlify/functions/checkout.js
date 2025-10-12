// netlify/functions/checkout.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { items } = JSON.parse(event.body || '{}');
    if (!Array.isArray(items) || !items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No items in request' }) };
    }

    // Build Stripe line_items from the client payload
    const line_items = items.map((i) => ({
      price: i.price,               // Stripe Price ID, e.g. "price_123"
      quantity: i.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      payment_method_types: ['card'],
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: 'Standard (5–7 days)',
            type: 'fixed_amount',
            fixed_amount: { amount: 599, currency: 'usd' },
          },
        },
        {
          shipping_rate_data: {
            display_name: 'Expedited (2–3 days)',
            type: 'fixed_amount',
            fixed_amount: { amount: 1299, currency: 'usd' },
          },
        },
      ],
      success_url: `${process.env.SITE_URL}/?success=true`,
      cancel_url: `${process.env.SITE_URL}/?canceled=true`,
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

