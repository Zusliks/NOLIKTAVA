import ROLES from "./ROLES.js";
import { databaseRequest, hashPassword } from "./AUTH.js";

const $ = (selector) => document.querySelector(selector);
const loginView = $("#loginView");
const dashboard = $("#dashboard");
const loginForm = $("#loginForm");
const loginMessage = $("#loginMessage");

function showLoginMessage(message) {
  loginMessage.textContent = message;
  loginMessage.className = "message error";
  loginMessage.hidden = false;
}

function renderDashboard(user) {
  const role = ROLES[user.role];
  if (!role) return;
  $("#userName").textContent = user.username;
  $("#roleName").textContent = role.label;
  $("#roleImage").src = role.image;
  $("#roleImage").alt = `${role.label} izvēlne`;
  $("#sidebarNavigation").replaceChildren(...role.menu.map(createMenuItem));
  loginView.hidden = true;
  dashboard.hidden = false;
}

function createMenuItem(label) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.href = "#";
  link.textContent = label;
  if (label === "Iziet") link.addEventListener("click", (event) => {
    event.preventDefault();
    logOut();
  });
  item.append(link);
  return item;
}

function logOut() {
  sessionStorage.removeItem("noliktava-user");
  dashboard.hidden = true;
  loginView.hidden = false;
  loginForm.reset();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(loginForm);
  const username = form.get("username").toString().trim().toLowerCase();
  const password = form.get("password").toString();
  const user = await databaseRequest("readonly", (store) => store.get(username));
  if (!user || user.passwordHash !== await hashPassword(password)) return showLoginMessage("Nepareizs lietotājvārds vai parole.");
  sessionStorage.setItem("noliktava-user", JSON.stringify({ username: user.username, role: user.role }));
  renderDashboard(user);
});

$("#logoutButton").addEventListener("click", logOut);
const savedUser = JSON.parse(sessionStorage.getItem("noliktava-user") || "null");
if (savedUser) renderDashboard(savedUser);
