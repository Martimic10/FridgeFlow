import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: "Price not configured." }, { status: 500 });
  }

  // Derive base URL from the request so NEXT_PUBLIC_BASE_URL is optional
  const origin = (process.env.NEXT_PUBLIC_BASE_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`).replace(/\/$/, "");

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/api/activate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      allow_promotion_codes: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout] Stripe error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
