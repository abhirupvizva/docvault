# DocVault Codebase Guide (Flow + How It Works)

This document explains how the DocVault website works end-to-end, and how the codebase is structured.

## 1) What the app is

DocVault is a Next.js App Router application where:

- Users sign in with Clerk and browse documents.
- Documents (PDFs) are stored in MongoDB GridFS.
- Users can view PDFs in an in-app viewer, download PDFs (if allowed), mark favorites, and track recently viewed docs.
- Admin users can upload PDFs, manage document visibility/download permissions, manage categories, manage users, and view analytics.

## 2) High-level request flow

At a high level, most flows look like this:

1. Browser loads a page route (e.g. `/`, `/dashboard`, `/admin/documents`).
2. Clerk protects routes that require authentication.
3. The page renders UI components.
4. UI components call server Route Handlers (`/api/...`) to fetch or mutate data.
5. Route Handlers authenticate via Clerk, check authorization (admin vs user), and call model functions in `lib/models/*`.
6. Model functions talk to MongoDB (and GridFS for PDF streaming).
7. Route Handler returns JSON (or a stream for PDFs).
8. UI updates based on the response.

## 3) Auth + route protection

### Protected areas

- `/dashboard/*` and `/admin/*` are protected using Clerk middleware.
- `/` (landing), `/sign-in/*`, `/sign-up/*` are public.

### How it’s implemented

- `proxy.ts` contains the Clerk middleware and route matchers.
- On the server, Route Handlers use `auth()` to get `userId`.
- Server pages use `auth()` and `redirect()` for server-side protection and redirects.

## 4) Pages and user journeys

### A) Landing → Sign in

Route: `/`

- `app/page.tsx` is a client component that calls `useAuth()`.
- If signed in, it redirects the user to `/dashboard`.
- If not signed in, it shows the landing UI with links to `/sign-in` and `/sign-up`.

Routes:

- `/sign-in/*` → `app/sign-in/[[...sign-in]]/page.tsx`
- `/sign-up/*` → `app/sign-up/[[...sign-up]]/page.tsx`

### B) User dashboard → Browse documents

Route: `/dashboard`

Server page: `app/dashboard/page.tsx`

Flow:

1. Server reads the Clerk session using `auth()`.
2. If there is no `userId`, redirect to `/sign-in`.
3. It attempts to ensure the user exists in MongoDB by calling `syncCurrentUser()`.
4. It renders the dashboard UI and includes `<DocumentBrowser />`.

Document list UI: `components/document-browser.tsx`

On mount, it loads:

- `GET /api/documents` → list of documents (non-admins only see `enabled`)
- `GET /api/user/favorites` → list of document IDs favorited by the user
- `GET /api/categories` → list of categories used for filtering

It supports:

- Search (by title and file name)
- Category filtering (client-side filter)
- Showing document cards

Document card UI: `components/document-card.tsx`

Supports:

- Favorite toggle: `POST /api/user/favorites` with `{ documentId }`
- Open viewer: shows `<PDFViewerModal />` and calls `POST /api/user/recent`
- Download: navigates to `GET /api/documents/:id` (also calls `POST /api/user/recent`)

### C) Viewing a PDF inline

Modal UI: `components/pdf-viewer-modal.tsx`

- Uses an `<iframe>` pointing to:
  - `GET /api/documents/:id/view`

The server returns the PDF stream with `Content-Disposition: inline` so the browser can display it.

### D) Admin dashboard

Route: `/admin`

Server page: `app/admin/page.tsx`

Flow:

1. `auth()` must return `userId`, otherwise redirect to `/sign-in`.
2. `syncCurrentUser()` ensures a DB user exists.
3. If the DB user is not `admin`, redirect to `/dashboard`.
4. Loads counts and storage stats from MongoDB for the admin overview.

### E) Admin: Manage documents + upload PDFs

Route: `/admin/documents`

Client page: `app/admin/documents/page.tsx`

Reads:

- `GET /api/documents` (admins see all statuses)
- `GET /api/categories`

Mutations:

- Upload (admin-only):
  - `POST /api/documents` as multipart/form-data
  - Validates: PDF only, max 50MB
  - Stores file in GridFS and metadata in `documents` collection
- Toggle enabled/disabled (admin-only):
  - `PATCH /api/documents/:id/toggle`
- Toggle download enabled/disabled (admin-only):
  - `PATCH /api/documents/:id/toggle-download`
- Delete document (admin-only):
  - `DELETE /api/documents/:id`

### F) Admin: Manage categories

Route: `/admin/categories`

Client page: `app/admin/categories/page.tsx`

Reads:

- `GET /api/categories`

Mutations:

- `POST /api/categories` (admin-only)
- `PUT /api/categories/:id` (admin-only)
- `DELETE /api/categories/:id` (admin-only)

Categories are stored in a `categories` collection with:

- `name`, `description`, `slug`, `createdAt`, `updatedAt`

### G) Admin: Manage users + roles

Route: `/admin/users`

Client page: `app/admin/users/page.tsx`

Reads:

- `GET /api/users` (admin-only)

Mutations:

- `PATCH /api/users/:clerkId/role` (admin-only) with `{ role: 'admin' | 'user' }`

### H) Admin: Analytics

Route: `/admin/analytics`

Server page: `app/admin/analytics/page.tsx`

Loads:

- Document counts (enabled/disabled/total)
- User count
- Storage stats (DB + GridFS)
- Category breakdown computed from documents

## 5) API endpoints (Route Handlers)

All API routes live under `app/api/*` (Next.js Route Handlers).

### Documents

- `GET /api/documents`
  - Auth required
  - Admin: sees all documents
  - User: sees only `enabled` documents
- `POST /api/documents` (admin only)
  - Uploads a PDF into GridFS + writes metadata into `documents`
- `GET /api/documents/:id`
  - Streams a PDF as an attachment (download)
  - Blocks download for non-admins if `downloadEnabled === false`
- `GET /api/documents/:id/view`
  - Streams a PDF inline (viewer)
- `PATCH /api/documents/:id/toggle` (admin only)
  - Flips `status` between `enabled` and `disabled`
- `PATCH /api/documents/:id/toggle-download` (admin only)
  - Flips `downloadEnabled` boolean
- `DELETE /api/documents/:id` (admin only)
  - Deletes metadata + removes GridFS file

### Categories

- `GET /api/categories`
  - Auth required
- `POST /api/categories` (admin only)
- `PUT /api/categories/:id` (admin only)
- `DELETE /api/categories/:id` (admin only)

### User favorites + recent

- `GET /api/user/favorites`
- `POST /api/user/favorites` with `{ documentId }`
- `GET /api/user/recent`
- `POST /api/user/recent` with `{ documentId }`

### Users (admin)

- `GET /api/users` (admin only)
- `PATCH /api/users/:clerkId/role` (admin only)

### Webhooks

- `POST /api/webhooks/clerk`
  - Clerk webhook verification via Svix headers and secret
  - Handles `user.created`, `user.updated`, `user.deleted` events

## 6) Database model and storage

### MongoDB connection

- `lib/mongodb.ts` creates a Mongo client and provides:
  - `getDb()` to access the `docvault` database
  - `getGridFSBucket()` for GridFS operations
  - storage stats helpers used by analytics/admin pages

### Collections

This app primarily uses:

- `users`
  - stores `clerkId`, profile info, `role`, favorites, recent docs
- `documents`
  - stores document metadata (`title`, `category`, `status`, `downloadEnabled`, etc.)
  - references the actual file via `fileId` (GridFS id)
- `categories`
  - stores category names and their slugs
- GridFS internal collections
  - `documents.files`, `documents.chunks` (bucket name defaults to `documents`)

### PDF upload + compression

When an admin uploads a PDF:

1. Route Handler validates file type and size.
2. File buffer is compressed with gzip.
3. Compressed file is stored in GridFS.
4. Document metadata is stored in `documents` with `fileId` referencing GridFS.

When a PDF is downloaded or viewed:

1. GridFS file stream is opened by `fileId`.
2. If the file is marked as compressed, the stream is decompressed with gunzip.
3. The stream is returned as a Web ReadableStream to the client.

## 7) Key folders (where to look for what)

- `app/`
  - All routes (pages) and server Route Handlers
- `components/`
  - UI and feature components (document browser, PDF modal, shared UI kit)
- `lib/`
  - Database connection, models, utilities
- `public/`
  - Static assets (logo)
- `scripts/`
  - Local scripts (e.g., seed user)

## 8) Environment configuration (local + deployment)

You typically need environment variables for:

- MongoDB connection (for server data access)
- Clerk keys and webhook secret (for auth and webhook verification)

Avoid committing secrets to git. Use local `.env` / platform env vars instead.

## 9) Common “how do I…?” pointers

- Change route protection behavior → `proxy.ts`
- Change document list filtering/search UI → `components/document-browser.tsx`
- Change PDF viewer behavior → `components/pdf-viewer-modal.tsx`
- Change upload validation/storage behavior → `app/api/documents/route.ts` and `lib/models/document.model.ts`
- Change what “admin” can do / authorization checks → `app/api/*` routes and `lib/models/user.model.ts`

