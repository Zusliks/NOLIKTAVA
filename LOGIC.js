import ROLES from "./ROLES.js";

const loginForm = document.querySelector("#loginForm");
const loginError = document.querySelector("#loginError");
const dashboard = document.querySelector("#dashboard");
const userName = document.querySelector("#userName");
const sessionId = document.querySelector("#sessionId");
const roleNavigation = document.querySelector("#roleNavigation");
const logoutButton = document.querySelector("#logoutButton");

const roleEntries = Object.entries(ROLES);

function createRoleCard([roleKey, role]) {
  const item = document.createElement("li");
  const link = document.createElement("a");

  link.className = "role-card";
  link.href = role.image;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.dataset.role = roleKey;
  link.innerHTML = `
    <img src="${role.image}" alt="${role.label}" />
    <strong>${role.label}</strong>
    <span>${role.description}</span>
  `;

  item.append(link);
  return item;}

function renderRoles() {
  roleNavigation.replaceChildren(...roleEntries.map(createRoleCard));}

function showError(message) {
  loginError.textContent = message;
  loginError.hidden = false;}

function clearError() {loginError.textContent = "";loginError.hidden = true;}

function createSessionId() {return globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}`;}

function logIn(username) {
  userName.textContent = username;
  sessionId.textContent = createSessionId();
  dashboard.hidden = false;
  loginForm.closest(".login-card").hidden = true;
  saveSession(username, sessionId.textContent);
}

sessionStorage.setItem("sessionId", sessionId.textContent);

function logOut() {
  dashboard.hidden = true;
  loginForm.closest(".login-card").hidden = false;
  loginForm.reset();
  sessionId.textContent = "-";
}

 function Register() {
  const username = new FormData(loginForm).get("username")?.toString().trim();
  if (!username) {showError("Ievadiet lietotājvārdu.");return;}
  const password = new FormData(loginForm).get("password")?.toString();
  if (!password) {showError("Ievadiet paroli.");return;}
 }

 function Validate() {
  if (!username == old.sessionId) {showError("Lietotājvārds jau eksistē.");return;}
  if (!password == old.sessionId) {showError("Parole jau eksistē.");return;}
 }
loginForm.addEventListener("submit", (event) => {event.preventDefault();clearError();

  const username = new FormData(loginForm).get("username")?.toString().trim();
  const password = new FormData(loginForm).get("password")?.toString();

  if (!username || !password) {showError("Ievadiet lietotājvārdu un paroli.");return;}

  logIn(username);});

logoutButton.addEventListener("click", logOut);
renderRoles();