import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getStripe, stripeConfigured, paymentMethodTypes } from "@/lib/stripe";

const schema = z.object({ slug: z.string(), locale: z.enum(["en", "zh"]).default("en") });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { slug, locale } = parsed.data;

  const demo = await prisma.demo.findUnique({ where: { slug } });
  if (!demo || !demo.isPremium) {
    return NextResponse.json({ error: "Demo not found or not premium" }, { status: 404 });
  }

  // Already unlocked? Short-circuit straight back to the demo.
  const existing = await prisma.unlock.findUnique({
    where: { userId_demoId: { userId: user.id, demoId: demo.id } },
  });
  const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
  if (existing) {
    return NextResponse.json({ url: `${base}/${locale}/demo/${slug}?unlocked=1` });
  }

  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Add STRIPE_SECRET_KEY to .env." },
      { status: 503 }
    );
  }

  const methods = paymentMethodTypes();
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: methods,
    ...(methods.includes("wechat_pay")
      ? { payment_method_options: { wechat_pay: { client: "web" } } }
      : {}),
    line_items: [
      {
        price_data: {
          currency: process.env.UNLOCK_CURRENCY || "usd",
          product_data: { name: locale === "zh" ? demo.titleZh : demo.titleEn },
          unit_amount: demo.priceCents,
        },
        quantity: 1,
      },
    ],
    client_reference_id: `${user.id}:${demo.id}`,
    metadata: { userId: user.id, demoId: demo.id },
    success_url: `${base}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}&slug=${slug}&lang=${locale}`,
    cancel_url: `${base}/${locale}/demo/${slug}`,
  });

  return NextResponse.json({ url: session.url });
}
