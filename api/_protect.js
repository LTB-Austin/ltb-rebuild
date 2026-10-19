// Shared spam protection for every form endpoint.
// Files in /api that start with "_" are not deployed as routes, so this is a helper only.
//
// Layers, in order:
//   1. Origin check  — the POST must come from our own site.
//   2. Honeypot      — a hidden field humans never fill.
//   3. Timing        — real people take more than a few seconds to fill a form.
//   4. Vercel BotID  — invisible CAPTCHA. The browser runs the challenge (js/botid-init.mjs);
//                      it is verified HERE, on the server, so bots cannot skip it.
//   5. Content       — links, SEO/crypto pitches, disposable emails, etc.
//
// Requirements for BotID (see FORMS.md):
//   - The endpoint path is listed in js/botid-init.mjs.
//   - vercel.json carries the BotID rewrites (already added).
//   - OIDC is enabled for the project (Vercel → Settings → Security). On by default for newer projects.
//
// Usage in an endpoint:
//   import { screen } from "./_protect.js";
//   const verdict = await screen(req, body, { form: "contact" });   // allowLinks: true where links are expected
//   if (verdict.action === "reject") return res.status(403).json({ error: verdict.message });
//   if (verdict.action === "drop")   return res.status(200).json({ ok: true });   // silent: bot thinks it worked
//   // "ok" or "flag"; on "flag", prefix the email subject with verdict.subjectTag

import { checkBotId } from "botid/server";

const MIN_FILL_MS = 3000;

const SPAM_PATTERNS = [
  /\bseo\b/i, /backlink/i, /guest\s*post/i, /rank(ing)?\s+(your|on)\s+(website|google)/i,
  /first\s+page\s+of\s+google/i, /web\s*(site)?\s*(design|development)\s+services/i,
  /lead\s*gen(eration)?\s+services/i, /\boutsourc/i, /virtual\s+assistant/i,
  /\bcrypto\b/i, /bitcoin/i, /\bforex\b/i, /\bcasino\b/i, /\bloan(s)?\b/i, /viagra|cialis\s+online/i,
  /increase\s+(your\s+)?(traffic|sales|revenue)/i, /\bunsubscribe\b/i, /dear\s+(sir|madam|business\s+owner)/i,
  /whatsapp\s*:?\s*\+?\d/i, /telegram\s*:?\s*@/i
];

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com", "temp-mail.org",
  "yopmail.com", "trashmail.com", "getnada.com", "sharklasers.com", "dispostable.com",
  "throwawaymail.com", "maildrop.cc", "fakeinbox.com", "mailnesia.com", "mintemail.com"
]);

const BLOCKED_MESSAGE =
  "We couldn't verify this submission. Please try again, or email us directly at alex@lettherebe.com.";

function originAllowed(req) {
  const src = req.headers.origin || req.headers.referer || "";
  if (!src) return false;
  let host;
  try { host = new URL(src).hostname; } catch { return false; }
  const extra = (process.env.ALLOWED_ORIGINS || "")
    .split(",").map(s => s.trim()).filter(Boolean)
    .map(s => { try { return new URL(s).hostname; } catch { return s; } });
  return (
    host === "lettherebe.com" || host.endsWith(".lettherebe.com") ||
    host.endsWith(".vercel.app") || host === "localhost" || host === "127.0.0.1" ||
    extra.includes(host)
  );
}

async function verifyBotId(req) {
  if (process.env.BOTID_DISABLED === "1") return { ok: true, skipped: true };
  try {
    const v = await checkBotId({ advancedOptions: { headers: req.headers } });
    return { ok: !v.isBot, verifiedBot: !!v.isVerifiedBot };
  } catch (e) {
    // Misconfiguration (e.g. OIDC off) should never cost a real lead: let it through, flagged.
    console.error("BotID check failed:", e && e.message);
    return { ok: true, error: true };
  }
}

function contentScore(b, opts = {}) {
  const reasons = [];
  const name = String(b.name || "");
  const email = String(b.email || "").toLowerCase();
  const company = String(b.company || "");
  const msg = String(b.message || "");
  const all = [name, company, msg].join(" \n ");

  const urls = (all.match(/https?:\/\/|www\./gi) || []).length;
  if (/https?:\/\/|www\./i.test(name)) reasons.push("link-in-name");
  if (urls >= 2 && !opts.allowLinks) reasons.push("multiple-links");
  if (SPAM_PATTERNS.some(re => re.test(all))) reasons.push("spam-phrasing");
  const domain = email.split("@")[1] || "";
  if (DISPOSABLE_DOMAINS.has(domain)) reasons.push("disposable-email");
  // Mostly non-Latin text in an English-language form is a strong spam signal.
  const letters = msg.replace(/[^\p{L}]/gu, "");
  if (letters.length > 40) {
    const latin = (letters.match(/\p{Script=Latin}/gu) || []).length;
    if (latin / letters.length < 0.5) reasons.push("non-latin-text");
  }
  if (name.length > 80 || /(.)\1{6,}/.test(name)) reasons.push("odd-name");
  return reasons;
}

export async function screen(req, b, opts = {}) {
  const reasons = [];

  // 1. Origin
  if (!originAllowed(req)) return { action: "drop", reasons: ["bad-origin"] };

  // 2. Honeypot
  if (b.hp) return { action: "drop", reasons: ["honeypot"] };

  // 3. Timing (the page sends how long the form was open)
  const t = Number(b.t);
  if (!Number.isFinite(t) || t < MIN_FILL_MS) return { action: "drop", reasons: ["too-fast"] };

  // 4. Vercel BotID
  const bot = await verifyBotId(req);
  if (!bot.ok) return { action: "reject", reasons: ["botid"], message: BLOCKED_MESSAGE };
  if (bot.error) reasons.push("botid-unavailable");

  // 5. Content
  const c = contentScore(b, opts);
  reasons.push(...c);
  const hard = c.includes("link-in-name") || c.length >= 3 ||
    (c.includes("spam-phrasing") && c.includes("multiple-links"));
  if (hard) return { action: "drop", reasons };
  if (reasons.length) return { action: "flag", reasons, subjectTag: "[Possible spam] " };
  return { action: "ok", reasons };
}
