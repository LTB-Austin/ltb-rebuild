// Vercel serverless — receives an RSQ Claims Lab submission and emails it via Resend.
// Reuses RESEND_API_KEY / CONTACT_FROM. CLAIMSLAB_TO (optional) — defaults to alex@lettherebe.com
export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if (b.hp) return res.status(200).json({ ok: true });
    const name = (b.name || "").trim();
    const email = (b.email || "").trim();
    const product = (b.product || "").trim();
    const challenge = (b.challenge || "").trim();
    if (!name || !email || !product || !challenge) {
      return res.status(400).json({ error: "Please include your name, email, product, and claims challenge." });
    }
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Email is not configured yet." });
    const to = process.env.CLAIMSLAB_TO || "alex@lettherebe.com";
    const from = process.env.CONTACT_FROM || "Let There Be <onboarding@resend.dev>";
    const text =
      "RSQ Claims Lab submission" +
      "\n\nName: " + name +
      "\nCompany: " + (b.company || "") +
      "\nRole: " + (b.role || "") +
      "\nEmail: " + email +
      "\nPhone: " + (b.phone || "") +
      "\n\nProduct: " + product +
      "\nProduct link: " + (b.productLink || "") +
      "\nRegulatory category: " + (b.category || "") +
      "\n\nClaims challenge:\n" + challenge +
      "\n\nAnything else:\n" + (b.notes || "") +
      "\n\nScheduled a slot yet: " + (b.scheduled || "not indicated");
    const payload = { from, to: [to], reply_to: email, subject: "RSQ Claims Lab — " + (b.company || name) + " — " + product, text };
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!r.ok) { const detail = await r.text().catch(() => ""); return res.status(502).json({ error: "Could not send.", detail }); }
    return res.status(200).json({ ok: true });
  } catch (e) { return res.status(500).json({ error: "Server error." }); }
}
