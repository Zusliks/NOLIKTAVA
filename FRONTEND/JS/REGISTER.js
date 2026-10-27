import ROLES from "./ROLES.js";
import { databaseRequest, hashPassword } from "./AUTH.js";

const $ = (selector) => document.querySelector(selector);
const registerForm = $("#registerForm");
const registerMessage = $("#registerMessage");
const roleSelect = $("#registerRole");

function showMessage(message, type = "error") {
  registerMessage.textContent = message;
  registerMessage.className = `message ${type}`;
  registerMessage.hidden = false;
}

for (const [key, role] of Object.entries(ROLES)) roleSelect.add(new Option(role.label, key));

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const form = new FormData(registerForm);
    const username = form.get("username")?.toString().trim().toLowerCase();
    const password = form.get("password")?.toString();
    const role = form.get("role")?.toString();
    if (!role || !ROLES[role]) return showMessage("Izvēlieties lomu.");
    if (!username || !password || username.length < 3 || password.length < 6) return showMessage("Lietotājvārdam vajag 3, parolei 6 simbolus.");
    if (await databaseRequest("users", "readonly", (store) => store.get(username))) return showMessage("Šāds lietotājs jau eksistē.");
    const passwordHash = await hashPassword(password);
    await databaseRequest("users", "readwrite", (store) => store.add({ username, role, passwordHash }));
    registerForm.reset();
    showMessage("Konts izveidots. Tagad varat pieslēgties.", "success");
  } catch {
    showMessage("Nevarēja saglabāt kontu. Pārbaudiet, vai lapa tiek atvērta caur localhost.");
  }
});
