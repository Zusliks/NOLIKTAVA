import { databaseRequest as db, hashPassword } from "./AUTH.js";

const $ = (s) => document.querySelector(s);
const form = $("#registerForm");
const msg = $("#registerMessage");

function say(text, type = "error") {
  msg.textContent = text;
  msg.className = `message ${type}`;
  msg.hidden = false;
}

const count = await db("users", "readonly", (s) => s.count());
if (count) {
  form.hidden = true;
  say("Jaunus lietotājus pievieno administrators.");
}
$("#registerRole").add(new Option("Administrators", "ADMIN", true, true));

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const f = new FormData(form);
    const username = f.get("username")?.toString().trim().toLowerCase();
    const password = f.get("password")?.toString();
    if (!username || !password || username.length < 3 || password.length < 6) return say("Lietotājvārdam vajag 3, parolei 6 simbolus.");
    if (await db("users", "readonly", (s) => s.count())) return say("Jaunus lietotājus pievieno administrators.");
    const passwordHash = await hashPassword(password);
    await db("users", "readwrite", (s) => s.add({ username, role: "ADMIN", passwordHash }));
    form.reset();
    form.hidden = true;
    say("Administratora konts izveidots. Tagad varat pieslēgties.", "success");
  } catch {
    say("Nevarēja saglabāt kontu.");
  }
});
