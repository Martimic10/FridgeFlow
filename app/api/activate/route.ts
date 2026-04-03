import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.redirect(new URL("/#pricing", req.url));
  }

  // Payment confirmed — set the access cookie and send them in
  const res = NextResponse.redirect(new URL("/app", req.url));
  res.cookies.set("fridgeflow_paid", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false,             // proxy.ts reads it server-side; keep readable
    sameSite: "lax",
  });
  return res;
}
