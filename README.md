# VIRALFLOW

VIRALFLOW is a local-first video optimizer for creators, with a broader workspace for export presets, post planning, captions, curated hashtags, manually imported analytics, and account-synced preferences.

## Run locally

Requirements: Node.js 20.9 or later, npm, and Docker Desktop (or another PostgreSQL 16 instance).

In PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up -d db
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The compose file binds the development database to localhost only. Its `change-me` password is for local development; replace it in every non-development environment.

## Database and accounts

The Prisma schema is in `prisma/schema.prisma`, with an initial migration in `prisma/migrations`. Configure `DATABASE_URL` in `.env` before running Prisma commands. `npm run db:migrate` applies migrations in development; use `npm run db:deploy` in a deployment pipeline after provisioning PostgreSQL.

Email/password registration requires a verified email address. Configure `APP_URL` and SMTP settings in `.env` before registering accounts. Verification links expire after 24 hours; password-reset links expire after 1 hour, are single-use, and revoke existing sessions when used. Only SHA-256 token hashes are stored. Passwords use bcrypt, must be at least 12 characters and no more than 72 UTF-8 bytes. Sign-out revokes the database session. Account and workspace endpoints validate input and use same-origin checks. Basic auth/API rate limiting is in-process; production deployments with multiple workers should replace it with a shared store and configure trusted proxy IP handling.

Workspace records and creator preferences are saved to each account's PostgreSQL row after sign-in. Existing local browser data is retained. A fresh account starts with the browser's current workspace and subsequent edits sync to the account. The video file itself remains on the user's device.

## Working tools

- **Video optimizer:** Select an MP4 or MOV up to 300 MB and re-encode it locally to an H.264/AAC MP4. Choose a high-detail, balanced, or compact output, then download it for manual upload with TikTok Web. Videos are not sent to VIRALFLOW. Encoding uses browser WebCodecs through Mediabunny; codec support and performance vary by browser/device, so current Chrome or Edge on desktop is recommended. Output is held in browser memory until downloaded; large files may use substantial memory. Re-encoding can reduce quality; keep the original master. This does not reproduce TikTok's proprietary compression pipeline.
- **Export presets:** Edit every setting, favorite and compare presets, and download settings as text.
- **Content calendar:** Add and remove local post reminders. These are not published to TikTok.
- **Analytics:** Enter post metrics manually, import/export CSV, and review charts from recorded values. CSV requires `date` and `views`; `post_time` (`HH:MM`), `likes`, `comments`, and `shares` are optional:

  ```csv
  date,post_time,views,likes,comments,shares
  2026-10-12,19:30,1200,85,9,4
  ```

- **Posting-time patterns:** Calculate observed average views by weekday and hour from timestamped posts in the selected timezone. These are small-sample observations, not follower activity or predictions.
- **Captions and hashtags:** Use editable templates and curated suggestions spanning anime, animation, gaming, sports, music, cinematic, VFX, autos, fashion, travel, and other editing styles. These are not live trends.
- **Creator preferences:** Set multiple editing categories, software, preferred style, timezone, target audience location, and posting frequency.
- **Video encoding library:** Mediabunny, licensed under MPL-2.0; see its [license](https://github.com/Vanilagy/mediabunny/blob/main/LICENSE).

## Configuring optional integrations

`.env.example` lists server-side SMTP settings required for email verification and password recovery, plus optional configuration keys for Google/Discord OAuth, TikTok, Stripe, and S3-compatible storage. The UI does not claim these optional connections are active; OAuth flows, TikTok publishing/analytics, payments, private video storage, and their provider-specific webhook handling are not implemented yet. Do not populate credentials in client-exposed `NEXT_PUBLIC_*` variables.

## Current product boundaries

This is a functional, database-backed foundation, not yet every production feature in the original product brief. In particular:

- Google/Discord OAuth, user-management/admin UI, and Stripe subscription checkout/webhooks are not implemented.
- TikTok account connection, authorized analytics import, automatic publishing, and upload scheduling are not enabled.
- Files are not stored in S3/cloud storage. The analyzer is browser-local and only checks dimensions, duration, and file size; codec, bitrate, frame-rate, color, audio, sharpness, artifacts, black frames, and FFmpeg-based reports need a secured server-side processing pipeline.
- Notifications, queue workers, backups, audit/usage dashboards, and production-grade distributed rate limiting require deployment services and are not represented as working features.
- Captions and hashtags are local templates/curated suggestions without live trend statistics.

Never infer or present missing metrics as real data. TikTok's exact media processing is not simulated.

## Validation

```powershell
npm run lint
npx tsc --noEmit
$env:DATABASE_URL="postgresql://viralflow:change-me@localhost:5432/viralflow?schema=public"
npx prisma validate
npm run build
```

## Free personal deployment

The recommended $0 starting setup for a personal, non-commercial site is **Vercel Hobby + Neon Free + Resend Free**. Vercel's Hobby terms limit use to personal or non-commercial projects. Free plans have usage limits and can change; Neon Free suspends its database after inactivity, and Resend Free currently limits sending to 100 emails per day. Your `viral.cc` domain must already be registered and under your control; domain registration/renewal is separate from free hosting.

1. Push this project to a private GitHub repository. Do not upload `.env`, `.env.production`, or any file containing real credentials.
2. Create a free Vercel account, import the repository, and deploy it as a Next.js project. The default `npm run build` intentionally uses Vercel's native build output. Leave the build and output-directory settings at their detected defaults.
3. Create a free Neon PostgreSQL project. In Vercel Project Settings → Environment Variables, set:
   - `DATABASE_URL`: Neon **pooled** connection string (the hostname contains `-pooler`).
   - `APP_URL`: `https://viral.cc`.
4. Apply migrations from this project directory using the Neon **direct/unpooled** connection string (without `-pooler`). In PowerShell:

   ```powershell
   $env:DATABASE_URL = "paste-your-Neon-direct-connection-string-here"
   npm run db:deploy
   Remove-Item Env:\DATABASE_URL
   ```

   Do not paste the connection string into chat or commit it. The Vercel app should continue using the pooled connection string.
5. Create a Resend account and verify `viral.cc` as a sending domain by adding the DNS records Resend provides. Add these server-only Vercel environment variables (use Production, Preview, and Development scopes as appropriate):

   ```text
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=resend
   SMTP_PASSWORD=<your Resend API key>
   SMTP_FROM=VIRALFLOW <no-reply@viral.cc>
   ```

   Set `SMTP_FROM` to an address on the domain you verified. Keep `SMTP_PASSWORD` private and never use a `NEXT_PUBLIC_` prefix.
6. In Vercel Project Settings → Domains, add `viral.cc` and follow the exact DNS records Vercel displays at your registrar. Wait for domain verification and HTTPS certificate provisioning.
7. Redeploy after setting environment variables. Check `https://viral.cc/api/health` returns `{"status":"ok"}`, then test account registration, verification email, sign-in/out, password reset, and workspace sync.

Official references: [Vercel Hobby terms](https://vercel.com/legal/terms#hobby-plan), [Vercel custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain), [Neon pricing](https://neon.com/pricing), [Neon with Prisma 6](https://www.prisma.io/docs/orm/v6/overview/databases/neon), and [Resend pricing](https://resend.com/pricing).

## Other deployment options

- **SmarterASP.NET:** Run `npm run package:smarterasp`; the command builds a standalone server and adds an IIS `web.config` under `.next/standalone`. Replace its database/SMTP placeholders privately, then upload the folder contents. The provider documents its Node app integration in its [Node.js guide](https://www.smarterasp.net/support/kb/a1970/quick-start-node_js.aspx). Its free trial does not include SMTP.
- **Linux Docker host:** Use `.env.production.example` and `compose.production.yml`; terminate HTTPS at a reverse proxy in front of the container.

Before public launch, configure shared rate limiting for multiple instances; the current limiter is per-process. Also configure monitoring and alerting, privacy/account deletion procedures, database backup restoration tests, and SMTP sender verification. Free tiers do not include an uptime guarantee and may suspend or change limits. The app does not currently store video files or provide TikTok publishing, authorized analytics, billing, or distributed job processing; do not advertise those as live features.
