import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

// Stripe webhook: the authoritative source of unlock grants in production.
// Configure with: stripe listen --forward-to localhost:3000/api/webhook
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const demoId = session.metadata?.demoId;
    if (session.payment_status === "paid" && userId && demoId) {
      await prisma.unlock.upsert({
        where: { userId_demoId: { userId, demoId } },
        update: {},
        create: { userId, demoId },
      });
    }
  }

  return NextResponse.json({ received: true });
}
