# Run DocVault (Local Development)

This guide explains how to run the full DocVault project locally (Next.js + Clerk + MongoDB).

## 1) Prerequisites

- Node.js (recommended: Node 20+)
- Bun (recommended: Bun 1.x)
- MongoDB (local or Atlas)
- Clerk app (for sign-in / sign-up and protected pages)

## 2) Install dependencies

From the project root:

```powershell
cd "F:\Resources Doc Vault\docvault"
bun install
```

## 3) Environment variables

Create a `.env.local` file in the project root (`docvault/.env.local`) and add at least:

```bash
MONGODB_URI=mongodb://localhost:27017
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Notes:

- `MONGODB_URI` is required. The app will throw an error if it is missing.
- `CLERK_WEBHOOK_SECRET` is required only if you use the webhook endpoint (`/api/webhooks/clerk`).
- If Clerk keys are missing, Clerk may run in “keyless mode” in development, but sign-in and protected pages may be limited.

## 4) Start MongoDB

You can use any MongoDB instance. For local MongoDB, make sure it’s running on `localhost:27017`.

If MongoDB is not running, the dashboard/admin pages will show a DB connection warning.

## 5) Run the dev server

```powershell
cd "F:\Resources Doc Vault\docvault"
bun run dev
```

Open:

- http://localhost:3000

## 6) Sign in and Admin access

### A) Create an account

- Visit `/sign-up` and create a user via Clerk.

### B) Make your user an admin

The app reads admin status from the MongoDB `users` collection (`role: "admin"`).

Option 1 (recommended): run the seed script

1) Edit `scripts/seed-user.ts` and replace:

- `clerkId: 'user_REPLACE_WITH_YOUR_CLERK_USER_ID'`

with your real Clerk user ID.

2) Run:

```powershell
cd "F:\Resources Doc Vault\docvault"
$env:MONGODB_URI="mongodb://localhost:27017/docvault"
bunx tsx scripts/seed-user.ts
```

Option 2: update MongoDB manually

- In MongoDB, find your user document in the `docvault.users` collection and set:
  - `role: "admin"`

## 7) Features to verify

### Documents (PDFs)

- User: `/dashboard` shows document browser (requires sign-in)
- Admin: `/admin/documents` lets admins upload PDFs (stored in GridFS)

### Videos (YouTube)

- Public list: `/videos`
- Watch page (requires sign-in): `/videos/[id]`
- Admin manage videos: `/admin/videos`
- Admin manage video categories: `/admin/video-categories`

Admin video input expects:

- `youtubeVideoId` (11 characters), not a full URL

## 8) Production build (optional)

```powershell
cd "F:\Resources Doc Vault\docvault"
bun run build
bun run start
```

Then open:

- http://localhost:3000

## 9) Troubleshooting

### “Please add your MongoDB URI to .env”

- Ensure `MONGODB_URI` is set in `.env.local`.

### ESLint script fails with “eslint not found”

- The project currently has a `lint` script but no ESLint dependency installed.
- You can still run the project without linting, or install ESLint later if needed.

