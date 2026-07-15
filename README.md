# 🎞️ MotionHub

A bilingual (中文 / EN) gallery of web motion & WebGL effects. Browse demos,
**copy the AI prompt** to regenerate an effect in your own AI tool, unlock
premium prompts with a one-time payment, and let creators publish their own.
Inspired by [motionsites.ai](https://motionsites.ai/).

> Lives in the `motionhub/` subfolder; the repo's existing IU music site is untouched.

## ✨ Features

| | |
|---|---|
| **Bilingual** | Every page under `/en` and `/zh`; one-click language switch. Demos store EN + ZH titles/summaries/prompts. |
| **Prompt gallery** | Each demo carries a copy-ready AI prompt. Free prompts are open; premium ones are paywalled. |
| **Payments** | Stripe Checkout. **Card + Alipay + WeChat Pay** from one integration (Stripe supports all three). One-time unlock per prompt, remembered per user. |
| **Creator uploads** | Signed-in users publish their own demos (`/upload`), bilingual fields, choose free or premium + price. |
| **Crawler** | `npm run crawl` pulls demo **metadata** (title / thumbnail / link) from Codrops hub & motionsites, stored **with attribution and a link back to the original**. Optional `--full` re-hosts the page HTML into the repo (see caveat). |

## 🚀 Quick start

```bash
cd motionhub
npm install
cp .env.example .env        # dev works out of the box with SQLite; add Stripe keys for real payments
npm run setup               # prisma db push + seed 6 sample demos
npm run dev                 # http://localhost:3000  → redirects to /en
```

## 🔑 Environment (`.env`)

- `DATABASE_URL` — SQLite by default. For production, set `provider = "postgresql"` in `prisma/schema.prisma` and point this at Postgres/Supabase.
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from the Stripe dashboard (test keys are fine).
- `STRIPE_WEBHOOK_SECRET` — from `stripe listen --forward-to localhost:3000/api/webhook`.
- `STRIPE_PAYMENT_METHODS` — e.g. `card,alipay,wechat_pay`. Enable Alipay & WeChat Pay in Stripe Dashboard → Payment methods first.
- `UNLOCK_PRICE_CENTS` / `UNLOCK_CURRENCY` — default price for premium unlocks.

Without Stripe keys the site runs fully — the gallery, uploads, and free prompts all work; only the paid unlock returns a friendly "payments not configured" message.

## 💳 Testing payments

1. Add Stripe **test** keys to `.env`.
2. `stripe listen --forward-to localhost:3000/api/webhook` and copy the `whsec_…` into `STRIPE_WEBHOOK_SECRET`.
3. Open a **premium** demo (e.g. *Magnetic Cursor Buttons*) → sign in → **Unlock** → pay with Stripe's test card `4242 4242 4242 4242`.
4. You're redirected back with the prompt unlocked. The unlock is granted both by the redirect handler and, authoritatively, by the webhook (idempotent).

## 🕷️ Crawler & attribution

```bash
npm run crawl -- --source codrops                 # metadata only (default)
npm run crawl -- --source motionsites --limit 30
npm run crawl -- --file ./page.html --base https://tympanus.net --source codrops   # offline
npm run crawl -- --source codrops --full          # ALSO re-host page HTML into public/embeds/
```

- **Default (metadata-only)** is the clean, long-term-safe mode: cards show the thumbnail + title and **link back to the original**; attributed third-party demos are created **free**, never paywalled.
- **`--full`** downloads the linked demo's HTML into `public/embeds/<slug>/` so it "lives in your repo". Re-hosting and monetizing work you don't own can infringe copyright or violate a site's ToS — this switch is per-run and per-demo, and the decision (and liability) is yours.

The parser (`parseCards`) is pure and unit-tested — run it offline with `npx tsx scripts/crawl.test.ts`. If a target site changes its markup, adjust the selectors in `scripts/crawl.ts`.

> ⚖️ Recommended model: keep crawled Codrops/motionsites demos **attributed and free** (they drive discovery and link out), and monetize only **original / creator-uploaded** prompts you have the rights to.

## 🏗️ Stack & layout

Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · Stripe.

```
src/
  app/
    [lang]/            # /en and /zh — gallery, demo/[slug], upload, pricing, account
    api/               # signin, signout, upload, checkout(+success), webhook
  components/          # DemoCard, Paywall, PromptBlock, UploadForm, AuthForm, Header, LangSwitch
  i18n/                # en.json, zh.json + tiny dictionary helper
  lib/                 # db (prisma), session (cookie auth), stripe, demos (data + localize), slug
prisma/                # schema + seed
scripts/               # crawl.ts (+ crawl.test.ts)
```

Auth is a deliberately lightweight cookie-based email identity so the app runs with zero OAuth secrets — swap `src/lib/session.ts` for NextAuth/Clerk/Auth.js in production. Creator uploads publish immediately (`status = published`); a `pending` state exists in the schema if you want moderation.

## ☁️ Deploy

Vercel: import the `motionhub/` directory, set the env vars, use a hosted Postgres (Supabase/Neon), add a Stripe webhook endpoint at `/api/webhook`. `npm run build` runs `prisma generate` automatically.
