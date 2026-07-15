import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

// Stripe redirects here after a successful payment. We verify the session and
// grant the unlock. The webhook does the same thing independently — whichever
// arrives first wins; the unique constraint makes the grant idempotent.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const slug = url.searchParams.get("slug") || "";
  const lang = url.searchParams.get("lang") || "en";
  const base = process.env.NEXT_PUBLIC_BASE_URL || url.origin;

  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      const userId = session.metadata?.userId;
      const demoId = session.metadata?.demoId;
      if (session.payment_status === "paid" && userId && demoId) {
        await prisma.unlock.upsert({
          where: { userId_demoId: { userId, demoId } },
          update: {},
          create: { userId, demoId },
        });
      }
    } catch {
      // If verification fails, fall through — the demo page will still gate.
    }
  }

  return NextResponse.redirect(`${base}/${lang}/demo/${slug}?unlocked=1`, { status: 303 });
}
