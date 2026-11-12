import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const allowedServices = new Set([
  "Performance Marketing",
  "Google Ads Management",
  "Meta Ads Management",
  "Search Engine Optimization",
  "Website Design & Development",
  "Landing Pages & CRO",
  "Local SEO",
  "Marketing Strategy",
  "Analytics & Conversion Tracking",
]);
const allowedTimes = new Set([
  "Morning (9 am–12 pm)",
  "Afternoon (12–4 pm)",
  "Evening (4–7 pm)",
]);
const encoder = new TextEncoder();

function response(body: Record<string, string>, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Vary": "Origin",
    },
  });
}

function safeText(value: unknown, maximum: number): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  if (clean.length > maximum || /[\u0000-\u001f\u007f]/.test(clean)) return null;
  return clean;
}

function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91${digits}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

async function fingerprint(ip: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(ip)));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function notifyOwner(lead: Record<string, string | boolean | null>) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const ownerEmail = Deno.env.get("OWNER_EMAIL");
  const from = Deno.env.get("EMAIL_FROM");
  if (!apiKey || !ownerEmail || !from) {
    console.info("Lead persisted; email notification is not configured.");
    return;
  }

  const detailRows = Object.entries(lead)
    .map(([key, value]) => `<tr><th align="left">${escapeHtml(key.replaceAll("_", " "))}</th><td>${escapeHtml(String(value))}</td></tr>`)
    .join("");
  try {
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [ownerEmail],
        subject: "New Verma Digital website enquiry",
        html: `<p>A new enquiry was securely stored in the Verma Digital leads dashboard.</p><table>${detailRows}</table>`,
      }),
    });
    if (!result.ok) console.error("Lead email notification failed after lead persistence.", result.status);
  } catch (error) {
    console.error("Lead email notification failed after lead persistence.", error);
  }
}

serve(async (request) => {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "";
  if (!allowedOrigin || origin !== allowedOrigin) {
    return response({ error: "This website origin is not allowed." }, 403, allowedOrigin || "null");
  }
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
        "Vary": "Origin",
      },
    });
  }
  if (request.method !== "POST") return response({ error: "Method not allowed." }, 405, allowedOrigin);
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 16_384) return response({ error: "Request is too large." }, 413, allowedOrigin);

  let payload: Record<string, unknown>;
  try {
    const body = await request.text();
    if (body.length > 16_384) return response({ error: "Request is too large." }, 413, allowedOrigin);
    payload = JSON.parse(body);
    if (!payload || Array.isArray(payload) || typeof payload !== "object") throw new Error("Invalid body");
  } catch {
    return response({ error: "Please submit a valid enquiry form." }, 400, allowedOrigin);
  }

  if (typeof payload.website === "string" && payload.website.trim()) {
    return response({ error: "This request could not be submitted. Please contact us by phone." }, 400, allowedOrigin);
  }
  const fullName = safeText(payload.full_name, 100);
  const phoneNumber = normalizePhone(payload.phone_number);
  const businessName = safeText(payload.business_name ?? "", 150);
  const serviceInterest = safeText(payload.service_interest ?? "", 80);
  const preferredTime = safeText(payload.preferred_contact_time ?? "", 60);
  const sourcePage = safeText(payload.source_page, 200);
  if (!fullName || fullName.length < 2) return response({ error: "Enter your name using at least 2 characters." }, 400, allowedOrigin);
  if (!phoneNumber) return response({ error: "Enter a valid Indian mobile number." }, 400, allowedOrigin);
  if (businessName === null || serviceInterest === null || preferredTime === null) {
    return response({ error: "One of the optional fields is too long or invalid." }, 400, allowedOrigin);
  }
  if (serviceInterest && !allowedServices.has(serviceInterest)) return response({ error: "Select a valid service of interest." }, 400, allowedOrigin);
  if (preferredTime && !allowedTimes.has(preferredTime)) return response({ error: "Select a valid preferred contact time." }, 400, allowedOrigin);
  if (payload.consent !== true) return response({ error: "Please agree to the privacy notice before submitting." }, 400, allowedOrigin);
  if (!sourcePage || !/^\/[A-Za-z0-9/_-]*$/.test(sourcePage)) return response({ error: "The enquiry page could not be verified." }, 400, allowedOrigin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const rateSecret = Deno.env.get("RATE_LIMIT_SECRET");
  if (!supabaseUrl || !serviceKey || !rateSecret) {
    console.error("Lead backend secrets are not fully configured.");
    return response({ error: "The enquiry service is temporarily unavailable. Please call +91 93196 72630 or try again later." }, 503, allowedOrigin);
  }

  const forwardedIp = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
  let fingerprintValue: string;
  try {
    fingerprintValue = await fingerprint(forwardedIp, rateSecret);
  } catch (error) {
    console.error("Lead rate-limit fingerprint could not be generated.", error);
    return response({ error: "The enquiry service is temporarily unavailable. Please try again later." }, 503, allowedOrigin);
  }
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" };
  let rateResult: Response;
  try {
    rateResult = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/rpc/consume_lead_rate_limit`, {
      method: "POST",
      headers,
      body: JSON.stringify({ p_fingerprint: fingerprintValue }),
    });
  } catch (error) {
    console.error("Lead rate-limit check failed.", error);
    return response({ error: "The enquiry service is temporarily unavailable. Please try again later." }, 503, allowedOrigin);
  }
  if (!rateResult.ok) {
    console.error("Lead rate-limit check failed.", rateResult.status);
    return response({ error: "The enquiry service is temporarily unavailable. Please try again later." }, 503, allowedOrigin);
  }
  let withinRateLimit: unknown;
  try {
    withinRateLimit = await rateResult.json();
  } catch (error) {
    console.error("Lead rate-limit check returned an invalid response.", error);
    return response({ error: "The enquiry service is temporarily unavailable. Please try again later." }, 503, allowedOrigin);
  }
  if (withinRateLimit !== true) {
    return response({ error: "Too many requests. Please wait a little before trying again, or call us directly." }, 429, allowedOrigin);
  }

  const lead = {
    full_name: fullName,
    phone_number: phoneNumber,
    business_name: businessName || null,
    service_interest: serviceInterest || null,
    preferred_contact_time: preferredTime || null,
    consent: true,
    source_page: sourcePage,
  };
  let insertResult: Response;
  try {
    insertResult = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/leads`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify(lead),
    });
  } catch (error) {
    console.error("Lead database insert failed.", error);
    return response({ error: "We couldn't save your request. Please try again or contact us by phone." }, 503, allowedOrigin);
  }
  if (!insertResult.ok) {
    console.error("Lead database insert failed.", insertResult.status);
    return response({ error: "We couldn't save your request. Please try again or contact us by phone." }, 503, allowedOrigin);
  }

  await notifyOwner(lead);
  return response({ message: "Your request has been received." }, 201, allowedOrigin);
});
