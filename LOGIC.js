import ROLES from "./ROLES.js";

const $ = (selector) => document.querySelector(selector);
const authView = $("#authView");
const dashboard = $("#dashboard");
const loginForm = $("#loginForm");
const registerForm = $("#registerForm");
const authMessage = $("#authMessage");
const roleSelect = $("#registerRole");
const dbPromise = new Promise((resolve, reject) => {
  const request = indexedDB.open("noliktava-db", 1);
  request.onupgradeneeded = () => request.result.createObjectStore("users", { keyPath: "username" });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

async function dbTransaction(mode, callback) {
  const database = await dbPromise;
  return new Promise((resolve, reject) => {
    const request = callback(database.transaction("users", mode).objectStore("users"));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function showMessage(message, type = "error") {
  authMessage.textContent = message;
  authMessage.className = `message ${type}`;
  authMessage.hidden = false;
}

function setAuthMode(mode) {
  const login = mode === "login";
  loginForm.hidden = !login;
  registerForm.hidden = login;
  $("#loginTab").classList.toggle("active", login);
  $("#registerTab").classList.toggle("active", !login);
  $("#loginTab").setAttribute("aria-selected", login);
  $("#registerTab").setAttribute("aria-selected", !login);
  authMessage.hidden = true;
}

function renderRoleOptions() {
  roleSelect.replaceChildren(...Object.entries(ROLES).map(([key, role]) => new Option(role.label, key)));
}

function renderDashboard(user) {
  const role = ROLES[user.role];
  $("#userName").textContent = user.username;
  $("#roleName").textContent = role.label;
  $("#roleImage").src = role.image;
  $("#roleImage").alt = `${role.label} izvēlne`;
  $("#sidebarNavigation").replaceChildren(...role.menu.map((label) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = label;
    link.dataset.action = label;
    if (label === "Iziet") link.addEventListener("click", (event) => { event.preventDefault(); logOut(); });
    item.append(link);
    return item;
  }));
  authView.hidden = true;
  dashboard.hidden = false;
}

function logOut() {
  sessionStorage.removeItem("noliktava-user");
  dashboard.hidden = true;
  authView.hidden = false;
  loginForm.reset();
  setAuthMode("login");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(loginForm);
  const username = form.get("username").toString().trim().toLowerCase();
  const password = form.get("password").toString();
  const user = await dbTransaction("readonly", (store) => store.get(username));
  if (!user || user.passwordHash !== await hashPassword(password)) return showMessage("Nepareizs lietotājvārds vai parole.");
  sessionStorage.setItem("noliktava-user", JSON.stringify({ username: user.username, role: user.role }));
  renderDashboard(user);
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(registerForm);
  const username = form.get("username").toString().trim().toLowerCase();
  const password = form.get("password").toString();
  const role = form.get("role").toString();
  if (username.length < 3 || password.length < 6) return showMessage("Lietotājvārdam vajag 3, parolei 6 simbolus.");
  if (await dbTransaction("readonly", (store) => store.get(username))) return showMessage("Šāds lietotājs jau eksistē.");
  const user = { username, role, passwordHash: await hashPassword(password) };
  await dbTransaction("readwrite", (store) => store.add(user));
  showMessage("Konts izveidots. Tagad varat pieslēgties.", "success");
  registerForm.reset();
  setAuthMode("login");
});

$("#loginTab").addEventListener("click", () => setAuthMode("login"));
$("#registerTab").addEventListener("click", () => setAuthMode("register"));
$("#logoutButton").addEventListener("click", logOut);
renderRoleOptions();
const savedUser = JSON.parse(sessionStorage.getItem("noliktava-user") || "null");
if (savedUser) renderDashboard(savedUser);
