# Forms and spam protection

Every form on the site goes through the same protection. The **server** decides what gets through, so bots that skip the page and post straight to `/api/...` are stopped there.

## What runs on every submission (`api/_protect.js`)

| Check | What it catches | What happens |
|---|---|---|
| Origin | Posts that don't come from lettherebe.com (or a Vercel preview) | Silently dropped |
| Honeypot | Bots that fill every field, including a hidden one | Silently dropped |
| Fill time | Submissions faster than 3 seconds, or with no timing at all | Silently dropped |
| Vercel BotID | Automated browsers (Playwright, Puppeteer, headless scripts) | Blocked, with a message pointing a real person to email us |
| Content | Link in the name field; SEO, backlink, crypto or "first page of Google" pitches; two or more links; disposable emails; mostly non-Latin text | Clear spam is dropped. Borderline gets delivered with **[Possible spam]** in the subject and the reasons at the bottom of the email |

"Silently dropped" means the bot gets a normal success response and no email is sent, so it has no reason to try again. Real leads are never blocked by the content check alone.

## Vercel BotID

BotID is Vercel's invisible CAPTCHA. Visitors never see a puzzle or checkbox.

**How it's wired:**
- `js/botid-init.mjs` runs the browser challenge and lists every protected endpoint.
- `js/botid-client.mjs` is the BotID browser code, copied from the `botid` npm package. Don't edit it.
- `vercel.json` carries the two BotID rewrites and one header Vercel requires.
- `package.json` installs `botid` for the API functions.

**One setting to check in Vercel:** Project → **Settings → Security** → make sure **OIDC Federation** (secure backend access) is enabled. It's on by default for newer projects. If it's off, forms still work but every email arrives tagged `[Possible spam]` with `botid-unavailable` at the bottom; that's the signal to turn it on.

**Optional, Pro plan:** Firewall → Rules → enable **BotID Deep Analysis**. It adds Kasada's machine-learning check. It costs $1 per 1,000 form submissions, which at our volume is effectively nothing. Basic BotID is free and is on without this.

**After deploying:** you can see BotID decisions under the project's **Firewall** tab (filter traffic by BotID). Testing with `curl` or by opening `/api/contact` in a browser will be blocked in production. Test by submitting the real form.

**Emergency off switch:** set the env var `BOTID_DISABLED=1` in Vercel. Every other check keeps running.

## Adding a new form

**1. HTML** — handle the submit in JavaScript with `fetch` (BotID does not work with a plain `action="/api/..."` form post). Include the hidden honeypot, and load BotID on the page:

```html
<form id="my-form" data-protect="partner" action="#" method="POST">
  <input type="text" name="company-website" id="m-hp" tabindex="-1" autocomplete="off"
         style="position:absolute;left:-9999px" aria-hidden="true">
  …fields…
  <button class="btn" type="submit">Send</button>
</form>
…
<script type="module" src="/js/botid-init.mjs"></script>
</body>
```

**2. Register the endpoint** in `js/botid-init.mjs`:

```js
{ path: "/api/partner", method: "POST" },
```

**3. JavaScript** — add the honeypot and fill time to the payload:

```js
var pf = LTBProtect.fields(form);
payload.hp = document.getElementById("m-hp").value;
payload.t  = pf.t;   // how long the form was open, in ms
fetch("/api/partner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
// on a 403, show the server's error message (it tells a real person to email us)
```

**4. API endpoint** — screen before sending anything:

```js
import { screen } from "./_protect.js";

const verdict = await screen(req, body, { form: "partner" });   // add allowLinks: true if links are expected
if (verdict.action === "reject") return res.status(403).json({ error: verdict.message });
if (verdict.action === "drop")   return res.status(200).json({ ok: true });
const tag = verdict.action === "flag" ? verdict.subjectTag : "";
// prefix the email subject with `tag`
```

No form should post to an endpoint that skips `screen()`, and every endpoint that calls `screen()` must be listed in `js/botid-init.mjs`, or BotID will block real people.
