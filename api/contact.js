// Vercel serverless function — receives the contact form and emails the team via Resend.
// Setup (one time): add env vars in Vercel → Settings → Environment Variables:
//   RESEND_API_KEY  (required)  — from resend.com
//   CONTACT_TO      (optional)  — defaults to alex@lettherebe.com
//   CONTACT_FROM    (optional)  — defaults to "Let There Be <onboarding@resend.dev>";
//                                  once your domain is verified in Resend, use e.g. "Website <hello@lettherebe.com>"
import { screen } from "./_protect.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    // Spam screen (origin, honeypot, timing, Vercel BotID, content) — see api/_protect.js
    const verdict = await screen(req, b, { form: "contact" });
    if (verdict.action === "reject") return res.status(403).json({ error: verdict.message });
    if (verdict.action === "drop") return res.status(200).json({ ok: true });   // bots think it worked
    const tag = verdict.action === "flag" ? verdict.subjectTag : "";

    const name = (b.name || "").trim();
    const email = (b.email || "").trim();
    if (!name || !email) return res.status(400).json({ error: "Please include your name and email." });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Email is not configured yet." });

    const to = process.env.CONTACT_TO || "alex@lettherebe.com";
    const from = process.env.CONTACT_FROM || "Let There Be <onboarding@resend.dev>";
    const company = (b.company || "").trim();
    const text =
      "Name: " + name +
      "\nEmail: " + email +
      "\nCompany: " + company +
      "\nExploring: " + (b.interest || "") +
      "\nFound us via: " + (b.source || "") +
      "\n\n" + (b.message || "") +
      (tag ? "\n\n---\nSpam signals: " + verdict.reasons.join(", ") : "");

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: tag + "Website inquiry — " + (company || name),
        text
      })
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return res.status(502).json({ error: "Could not send the message.", detail });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Server error." });
  }
}
