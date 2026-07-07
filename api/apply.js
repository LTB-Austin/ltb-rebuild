// Vercel serverless — receives a careers application (with optional resume file) and emails it via Resend.
// Reuses the SAME RESEND_API_KEY (and CONTACT_FROM) already set up for the contact form.
//   CAREERS_TO (optional) — defaults to shivaya@lettherebe.com
export const config = { api: { bodyParser: { sizeLimit: "6mb" } } };
export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if (b.hp) return res.status(200).json({ ok: true });
    const name = (b.name || "").trim();
    const email = (b.email || "").trim();
    if (!name || !email) return res.status(400).json({ error: "Please include your name and email." });
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Email is not configured yet." });
    const to = process.env.CAREERS_TO || "shivaya@lettherebe.com";
    const from = process.env.CONTACT_FROM || "Let There Be <onboarding@resend.dev>";
    const role = (b.role || "General application").trim();
    const text =
      "Role: " + role +
      "\nName: " + name +
      "\nEmail: " + email +
      "\nPhone: " + (b.phone || "") +
      "\nLocation: " + (b.location || "") +
      "\nPortfolio / website: " + (b.portfolio || "") +
      "\nLinkedIn: " + (b.linkedin || "") +
      "\nHeard about it via: " + (b.hear || "") +
      "\nResume attached: " + (b.resumeFileB64 ? (b.resumeFileName || "yes") : "no (none uploaded)") +
      "\n\n" + (b.message || "");
    const payload = { from, to: [to], reply_to: email, subject: "Application — " + role + " — " + name, text };
    if (b.resumeFileB64 && b.resumeFileName) {
      payload.attachments = [{ filename: b.resumeFileName, content: b.resumeFileB64 }];
    }
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!r.ok) { const detail = await r.text().catch(() => ""); return res.status(502).json({ error: "Could not send.", detail }); }
    return res.status(200).json({ ok: true });
  } catch (e) { return res.status(500).json({ error: "Server error." }); }
}
