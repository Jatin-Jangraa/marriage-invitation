# Vivaha — architecture & data model

## Application architecture

- Next.js App Router: server-rendered admin/public pages; route handlers own all mutations and public reads.
- `lib/db.ts`: cached Mongoose connection. `models/`: Google users, customer requests, invitations, and privacy-minimal analytics schemas.
- `auth.ts`: Google OAuth through Auth.js. New verified Google accounts are saved with the `user` role; existing roles are never changed by sign-in.
- `lib/auth.ts`: resolves the signed-in user from MongoDB on each protected request, so the database role controls access.
- `schemas/invitation.ts`: Zod request boundary; invitation create and management APIs require the `admin` role.
- `schemas/invitation-request.ts`: customer request validation. Users can submit and view only their own wedding-invitation requests; admins review all requests.
- `lib/cloudinary.ts`: server-signed image upload and deletion. References are stored as Cloudinary asset IDs and URLs; assets are not cascade-deleted when invitations are deleted.
- `app/invite/[slug]`: server-side published-only query, SEO metadata, invitation experience, event timeline and map links. View analytics store date, coarse device and referrer category only.
- `components/admin/invitation-editor.tsx`: React Hook Form and Zod multi-section editor; `components/invitation/opening.tsx`: reduced-motion-aware invitation opening.

## MongoDB schema

`User`: Google subject, normalized email (unique index), name, profile image, role (`admin` or `user`), timestamps. Google sign-in creates users as `user`; admins change trusted users to `admin` in MongoDB.

`InvitationRequest`: customer user reference and email, couple names, optional wedding date, phone, venue, city, style, notes, and status (`pending`, `reviewing`, `completed`, `declined`). Customers can read only their own requests.

`WeddingInvitation`: unique `slug`; groom/bride identities and photo media references; family names; wedding date, time, muhurat, venue and address; ordered event subdocuments; localized invitation and closing text; gallery references; independent design settings; media/music; draft/published/archived status; publishedAt; timestamps. Indexes support slug lookup and status/date dashboard filters.

`Analytics`: invitation reference, day bucket, referral category and device category. No IP address or persistent visitor identifier is retained. An index supports invitation/date aggregation.

Event data is embedded because each event belongs to one invitation and is edited with its parent. Media is referenced by URL/asset ID and intentionally not cascade deleted, allowing safe reuse across invitations. Every public query projects only invitation content and requires `status=published`.

## Request lifecycle

1. Verify Google sign-in and save the profile in MongoDB without changing an existing role.
2. Read the current role from MongoDB for every protected route. Only admins can create or manage invitation cards.
3. Users submit wedding details as an invitation request and can see their own request statuses. Admins review requests and create the invitation card in the admin studio.
4. Publishing checks the unique slug; QR is generated from the configured site URL and invitation slug. Public slug routes resolve only published records.

## Deployment

Install dependencies, set variables from `.env.example`, provision MongoDB Atlas and Cloudinary, set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin, and deploy to Vercel. Create a Google OAuth web client and add `https://YOUR_DOMAIN/api/auth/callback/google` as an authorized redirect URI (also add `http://localhost:3000/api/auth/callback/google` for local development). The first Google account signs in as `user`; promote the trusted account by changing its MongoDB `User.role` to `admin` (for example, `db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })`). Thereafter, MongoDB is the source of truth for roles. Configure Vercel's deployment protection and MongoDB network allowlist for production.
