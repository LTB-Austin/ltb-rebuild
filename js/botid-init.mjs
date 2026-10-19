// Vercel BotID — runs an invisible check in the browser and attaches it to form posts.
// Every form endpoint must be listed here AND call screen() from api/_protect.js.
import { initBotId } from "/js/botid-client.mjs";

initBotId({
  protect: [
    { path: "/api/contact", method: "POST" },
    { path: "/api/apply", method: "POST" },
  ],
});
