# Vivaha — architecture & data model

## Application architecture

- Next.js App Router: server-rendered admin/public pages; route handlers own all mutations and public reads.
- `lib/db.ts`: cached Mongoose connection. `models/`: versionable invitation, admin and privacy-minimal analytics schemas.
- `lib/auth.ts`: signed, httpOnly, same-site JWT session cookie; credentials are verified against a bcrypt hash. First admin comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD` at deploy time and is created on first successful login.
- `schemas/invitation.ts`: Zod request boundary; `app/api/admin/**` checks the admin session on every request.
- `lib/cloudinary.ts`: server-signed image upload and deletion. References are stored as Cloudinary asset IDs and URLs; assets are not cascade-deleted when invitations are deleted.
- `app/invite/[slug]`: server-side published-only query, SEO metadata, invitation experience, event timeline and map links. View analytics store date, coarse device and referrer category only.
- `components/admin/invitation-editor.tsx`: React Hook Form and Zod multi-section editor; `components/invitation/opening.tsx`: reduced-motion-aware invitation opening.

## MongoDB schema

`Admin`: name, normalized email (unique index), passwordHash, role, timestamps.

`WeddingInvitation`: unique `slug`; groom/bride identities and photo media references; family names; wedding date, time, muhurat, venue and address; ordered event subdocuments; localized invitation and closing text; gallery references; independent design settings; media/music; draft/published/archived status; publishedAt; timestamps. Indexes support slug lookup and status/date dashboard filters.

`Analytics`: invitation reference, day bucket, referral category and device category. No IP address or persistent visitor identifier is retained. An index supports invitation/date aggregation.

Event data is embedded because each event belongs to one invitation and is edited with its parent. Media is referenced by URL/asset ID and intentionally not cascade deleted, allowing safe reuse across invitations. Every public query projects only invitation content and requires `status=published`.

## Request lifecycle

1. Validate payload with Zod, check session and throttle login/upload/API mutations.
2. Connect through the cached Mongo client and persist one invitation document.
3. Publish checks the unique slug before transition; QR is generated from the configured site URL and the invitation slug.
4. Public slug route resolves only published records and emits metadata, content, and a privacy-minimal view bucket.

## Deployment

Install dependencies, set variables from `.env.example`, provision MongoDB Atlas and Cloudinary, set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin, and deploy to Vercel. Create the initial admin through the login form with the configured bootstrap credentials; rotate the password in the hosting environment after provisioning. Configure Vercel's deployment protection and MongoDB network allowlist for production.
