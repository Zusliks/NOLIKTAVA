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
  $("#sidebarNavigation").replaceChildren(...role.menu.map(createMenuItem));
  loginView.hidden = true;
  dashboard.hidden = false;
}

function createMenuItem([label, iconName]) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.href = "#";
  link.append(createIcon(iconName), document.createTextNode(label));
  if (iconName === "logout") link.addEventListener("click", (event) => {
    event.preventDefault();
    logOut();
  });
  item.append(link);
  return item;
}

function createIcon(name) {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("class", "menu-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const paths = {
    home: "M3 10.5 12 3l9 7.5M5 9v11h14V9M9 20v-6h6v6",
    add: "M12 5v14M5 12h14",
    "user-add": "M15 20v-2a4 4 0 0 0-8 0v2M11 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 8v6M16 11h6",
    users: "M16 20v-2a4 4 0 0 0-8 0v2M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 8a3 3 0 0 1 0 6M20 20v-2a4 4 0 0 0-2-3.5",
    order: "M3 7h13v10H3zM16 10h3l3 3v4h-6M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
    report: "M5 3h10l4 4v14H5zM15 3v5h5M8 12h8M8 16h8",
    shelf: "M4 4h16v16H4zM4 9h16M4 15h16M10 4v5M15 9v6M10 15v5",
    user: "M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6M5 21a7 7 0 0 1 14 0",
    logout: "M10 17l5-5-5-5M15 12H3M21 3v18"
  };
  path.setAttribute("d", paths[name] || paths.home);
  icon.append(path);
  return icon;
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
