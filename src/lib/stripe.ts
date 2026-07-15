import Stripe from "stripe";

// Instantiated lazily so the app boots (and pages render) even without keys set —
// only the checkout/webhook routes require a real key.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith("sk_test_xxx")) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Copy .env.example to .env and add your test key."
    );
  }
  // Pin to the SDK's default pinned version to stay type-safe across upgrades.
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

export function stripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!key && !key.startsWith("sk_test_xxx");
}

// card is always available; alipay + wechat_pay require enabling in the Stripe
// Dashboard and a supported account country/currency.
export function paymentMethodTypes(): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  const raw = process.env.STRIPE_PAYMENT_METHODS ?? "card";
  const allowed = ["card", "alipay", "wechat_pay"];
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => allowed.includes(s));
  return (list.length ? list : ["card"]) as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];
}
