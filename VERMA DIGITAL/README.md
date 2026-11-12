# Verma Digital website

A lightweight, multi-page website for Verma Digital. The frontend is static HTML, CSS and JavaScript with no build-time package dependencies. Enquiries are stored by a Supabase Edge Function; form submissions are not reported as successful unless the database insert succeeds.

## Pages

- `/` — Homepage and three-slide introduction
- `/about/` — Founder and working principles
- `/services/` — Service directory
- `/services/performance-marketing/`
- `/services/google-ads/`
- `/services/meta-ads/`
- `/services/seo/`
- `/services/website-development/`
- `/services/conversion-optimization/`
- `/services/local-seo/`
- `/services/marketing-strategy/`
- `/services/analytics-tracking/`
- `/blog/` — Exactly two initial articles
- `/blog/google-ads-vs-meta-ads/`
- `/blog/why-your-website-is-not-generating-leads/`
- `/contact/`
- `/privacy-policy/`
- `/terms/`

Each route has its own HTML document and metadata. Host the site at a domain root on a static host that serves directory `index.html` files and supports clean paths. Do not deploy under a subdirectory without first adjusting the root-relative links in the site.

## Configure the site domain

Edit `assets/site-config.js` before deployment:

```js
window.VD_CONFIG = {
  leadEndpoint: "https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit-lead",
  siteUrl: "https://your-real-domain.example"
};
```

Replace both example values with the actual Supabase project URL and the final HTTPS website origin. Do not put a Supabase service-role key or other secret in this file. `siteUrl` must be only the origin (no trailing slash or path). It is used to set canonical URLs and structured-data URLs.

Replace every `__SITE_URL__` in `robots.txt` and `sitemap.xml` with the actual public website origin, then check that the sitemap is available at `/sitemap.xml` and that the sitemap URL in `/robots.txt` is correct. The domain is intentionally not invented.

## Configure persistent lead collection

1. Create a Supabase project and open its SQL Editor.
2. Run the contents of [`supabase/schema.sql`](./supabase/schema.sql). This creates the `public.leads` table and the private rate-limit helper. Row-level security is enabled, and no public read, update or insert policy is created. The browser never connects directly to the database.
3. Install the Supabase CLI, authenticate and link it to the project, then deploy the public form endpoint from the workspace root:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy submit-lead --no-verify-jwt
   ```

   The endpoint is intentionally unauthenticated so visitors can submit enquiries; `supabase/config.toml` also records this setting. Validation, exact-origin CORS checks, rate limiting, honeypot handling and server-only database credentials protect the endpoint. The function uses Deno and the Supabase Edge Runtime; no service-role credential belongs in the website.
4. Configure Edge Function secrets in the Supabase dashboard:

   | Secret | Required | Purpose |
   | --- | --- | --- |
   | `SUPABASE_URL` | Yes | Supabase project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only database insert and rate-limit RPC access |
   | `ALLOWED_ORIGIN` | Yes | Exact deployed site origin, e.g. `https://your-real-domain.example` |
   | `RATE_LIMIT_SECRET` | Yes | Random secret used to HMAC-hash the request IP for rate limiting |
   | `OWNER_EMAIL` | Email notifications | Inbox to notify; the owner must supply this |
   | `RESEND_API_KEY` | Email notifications | Resend API credential |
   | `EMAIL_FROM` | Email notifications | Sender identity on a domain verified with Resend |

   Supabase may automatically provide `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions. Verify that they are present in the deployed function environment; otherwise configure them as secrets there. Generate `RATE_LIMIT_SECRET` with a secure random generator. Never add these server-side values to `site-config.js`, HTML, JavaScript or a public repository.
5. Set `leadEndpoint` in `assets/site-config.js` to the deployed function URL and `siteUrl` to the final website origin. Deploy the static website, then set `ALLOWED_ORIGIN` to that exact origin (scheme and host, no trailing slash). Redeploy or update the function secret if the website domain changes.

The function validates all fields server-side, normalizes Indian mobile numbers, checks consent and allowed dropdown values, rejects a hidden honeypot field, applies a limit of five valid requests per IP per 15-minute window, and stores only an HMAC fingerprint for that limiter. Old rate-limit fingerprints are not raw IP addresses. The database row remains the persistent source of truth.

### Review and manage leads

Sign in to the Supabase project dashboard with an authorized owner/admin account. Open **Table Editor → public.leads** to review enquiries, sort by `created_at`, and update the `status` field (`new`, `contacted`, `qualified`, `closed` or `spam`). The website provides no public leads dashboard or public API for reading lead data. Limit Supabase dashboard access to trusted administrators.

### Email notification setup

Email is an optional additional notification. Create a Resend account, verify a sender domain and configure `RESEND_API_KEY`, `OWNER_EMAIL` and `EMAIL_FROM` as function secrets. A missing or failed email does not undo a lead already saved in Supabase; the function logs notification failures without logging enquiry details. Check the Supabase leads table even if an email notification is delayed or unavailable. No owner email address is assumed or prefilled.

Form submissions do not send WhatsApp notifications. Visitors can choose the direct WhatsApp link to message `+91 9319672630`.

## Local preview and deployment

No package installation or compilation is required. To preview directly from disk, open the workspace-root `index.html` in a browser. Local page links, navigation, styles and scripts use file-relative URLs so they work from `file://` pages as well.

The enquiry form still needs the deployed Supabase Edge Function and may be blocked by browser cross-origin restrictions when opened from `file://`. For a complete preview, including form requests, serve the workspace root with a local static file server. For deployment, use a static host such as Cloudflare Pages, Netlify or an equivalent host that serves directory `index.html` files and clean routes.

For production, enable HTTPS, configure the site origin in the Supabase function, avoid caching the lead function response, and keep administrator and API credentials out of browser code. Use the hosting provider's recommended security headers and deployment settings.

## Before launch

- Set the real public domain and Supabase function endpoint in `assets/site-config.js`.
- Replace `__SITE_URL__` in `robots.txt` and `sitemap.xml`.
- Run the SQL schema and deploy the Edge Function.
- Configure function secrets and the exact allowed website origin.
- Optionally configure a verified Resend sender and owner-controlled notification inbox.
- Submit a test enquiry and verify the row appears in Supabase before relying on the form. Remove test data after verification.
- Review the starter privacy and terms pages for the owner's actual retention, contact, provider and legal details.
- Confirm business details and locality are correct. A street address and map are intentionally omitted because neither has been verified.

Until the form endpoint is configured, form submissions display an explicit setup message and offer phone/WhatsApp contact. They are not stored and are not represented as successful.
