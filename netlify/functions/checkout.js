// netlify/functions/checkout.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { items } = JSON.parse(event.body || "{}");

    if (!Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "No items in request" }),
      };
    }

    // Validate items early (prevents silent failures)
    const invalid = items.filter(
      (i) => !i.price || typeof i.price !== "string" || !i.price.startsWith("price_")
    );
    if (invalid.length) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Invalid price id in cart",
          invalid,
        }),
      };
    }

    const line_items = items.map((i) => ({
      price: i.price,
      quantity: Number(i.quantity) > 0 ? Number(i.quantity) : 1,
    }));

    // Prefer Netlify's URL if SITE_URL isn't set
    const baseUrl = process.env.SITE_URL || process.env.URL;

    if (!baseUrl) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Missing SITE_URL/URL environment variable",
        }),
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      // payment_method_types can be omitted; Stripe defaults appropriately
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: "Standard (5–7 days)",
            type: "fixed_amount",
            fixed_amount: { amount: "$0.00", currency: "usd" },
          },
        },
        {
          shipping_rate_data: {
            display_name: "Expedited (2–3 days)",
            type: "fixed_amount",
            fixed_amount: { amount: "$2.99", currency: "usd" },
          },
        },
      ],
      success_url: `${baseUrl}/?success=true`,
      cancel_url: `${baseUrl}/?canceled=true`,
      allow_promotion_codes: true,
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe checkout error:", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: err.message || "Server error",
      }),
    };
  }
};
