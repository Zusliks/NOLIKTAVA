import ROLES from "./ROLES.js";
import { databaseRequest, hashPassword } from "./AUTH.js";

const $ = (selector) => document.querySelector(selector);
const loginView = $("#loginView");
const dashboard = $("#dashboard");
const loginForm = $("#loginForm");
const loginMessage = $("#loginMessage");
const view = $("#dashboardView");
const STATUSES = ["Jauns", "Apstrādē", "Pabeigts"];
const ICONS = {
  home: "M3 10.5 12 3l9 7.5M5 9v11h14V9M9 20v-6h6v6",
  users: "M16 20v-2a4 4 0 0 0-8 0v2M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 8a3 3 0 0 1 0 6M20 20v-2a4 4 0 0 0-2-3.5",
  shelf: "M4 4h16v16H4zM4 9h16M4 15h16M10 4v5M15 9v6M10 15v5",
  box: "M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10",
  pin: "M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  order: "M3 7h13v10H3zM16 10h3l3 3v4h-6M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  report: "M5 3h10l4 4v14H5zM15 3v5h5M8 12h8M8 16h8",
  logout: "M10 17l5-5-5-5M15 12H3M21 3v18"
};
let currentUser = null;
let currentAction = "home";

const getAll = (store) => databaseRequest(store, "readonly", (s) => s.getAll());
const save = (store, item) => databaseRequest(store, "readwrite", (s) => s.put(item));
const remove = (store, key) => databaseRequest(store, "readwrite", (s) => s.delete(key));
const menu = () => ROLES[currentUser.role].menu;
const refresh = () => showView(currentAction);

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

const button = (textContent, onclick) => el("button", { type: "button", className: "list-action", textContent, onclick });
const select = (options, value) => el("select", {}, ...options.map(([key, label]) => new Option(label, key, false, key === value)));

function list(items, row) {
  view.append(el("ul", { className: "data-list" }, ...items.map((item) => el("li", {}, ...row(item)))));
}

function form(fields, textContent, submit) {
  const node = el("form", { className: "data-form" }, ...fields.map(([name, type, placeholder]) => el("input", { name, type, placeholder, required: true, min: 0 })), el("button", { type: "submit", textContent }));
  node.onsubmit = async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(node));
    for (const key in data) data[key] = key === "quantity" ? Number(data[key]) : data[key].trim();
    await submit(data);
    refresh();
  };
  view.append(node);
}

function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  svg.setAttribute("class", "menu-icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  path.setAttribute("d", ICONS[name]);
  svg.append(path);
  return svg;
}

async function editQuantity(product) {
  const value = prompt("Daudzums:", product.quantity);
  if (/^\d+$/.test(value ?? "")) await save("products", { ...product, quantity: Number(value) });
  refresh();
}

async function products(canDelete) {
  form([["name", "text", "Preces nosaukums"], ["quantity", "number", "Daudzums"]], "Pievienot", (data) => save("products", data));
  list(await getAll("products"), (product) => [
    `${product.name} — ${product.quantity}`,
    ...(canDelete ? [button("Dzēst", () => remove("products", product.id).then(refresh))] : []),
    button("Rediģēt", () => editQuantity(product))
  ]);
}

const views = {
  home: () => list(ROLES[currentUser.role].tasks, (task) => [task]),
  users: async () => {
    view.append(el("a", { href: "REGISTER.html", textContent: "+ Pievienot lietotāju" }));
    list(await getAll("users"), (user) => {
      if (user.username === currentUser.username) return [`${user.username} — ${ROLES[user.role].label} (jūs)`];
      const role = select(Object.entries(ROLES).map(([key, r]) => [key, r.label]), user.role);
      return [user.username, role, button("Dzēst", () => remove("users", user.username).then(refresh)), button("Saglabāt", () => save("users", { ...user, role: role.value }).then(refresh))];
    });
  },
  data: () => products(true),
  products: () => products(false),
  stock: async () => list(await getAll("products"), (product) => [`${product.name} — ${product.quantity}`]),
  orders: async () => {
    form([["product", "text", "Prece"], ["quantity", "number", "Daudzums"]], "Izveidot pasūtījumu", (data) => save("orders", { ...data, status: "Jauns" }));
    list(await getAll("orders"), (order) => {
      const status = select(STATUSES.map((s) => [s, s]), order.status);
      return [`${order.product} (${order.quantity})`, status, button("Saglabāt", () => save("orders", { ...order, status: status.value }).then(refresh))];
    });
  },
  locations: async () => {
    const locations = await getAll("locations");
    form([["product", "text", "Prece"], ["shelf", "text", "Plaukta vieta"]], "Saglabāt", (data) => save("locations", { ...locations.find((l) => l.product === data.product), ...data }));
    list(locations, (location) => [`${location.product} — ${location.shelf}`]);
  },
  report: async () => {
    const [products, orders, locations] = await Promise.all(["products", "orders", "locations"].map((store) => getAll(store)));
    list(products, (p) => [`${p.name} — ${p.quantity} gab. — ${locations.find((l) => l.product === p.name)?.shelf || "nav izvietota"}`]);
    list(STATUSES, (s) => [`Pasūtījumi "${s}": ${orders.filter((o) => o.status === s).length}`]);
  }
};

function showView(action) {
  const [label, , key] = menu().find((item) => item[2] === action) || menu()[0];
  currentAction = key;
  view.replaceChildren(el("h3", { textContent: label }));
  document.querySelectorAll("#sidebarNavigation a").forEach((a) => a.classList.toggle("active", a.dataset.action === key));
  views[key]();
}

function menuItem([label, iconName, action]) {
  const link = el("a", { href: "#" }, icon(iconName), label);
  link.dataset.action = action;
  link.onclick = (event) => {
    event.preventDefault();
    action === "logout" ? logOut() : showView(action);
  };
  return el("li", {}, link);
}

function renderDashboard(user) {
  if (!ROLES[user.role]) return;
  currentUser = user;
  $("#userName").textContent = user.username;
  $("#roleName").textContent = ROLES[user.role].label;
  $("#sidebarNavigation").replaceChildren(...[...menu(), ["Iziet", "logout", "logout"]].map(menuItem));
  showView("home");
  loginView.hidden = true;
  dashboard.hidden = false;
}

function logOut() {
  sessionStorage.removeItem("noliktava-user");
  currentUser = null;
  dashboard.hidden = true;
  loginView.hidden = false;
  loginForm.reset();
}

function showLoginMessage(message) {
  loginMessage.textContent = message;
  loginMessage.className = "message error";
  loginMessage.hidden = false;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const form = new FormData(loginForm);
    const username = form.get("username")?.toString().trim().toLowerCase();
    const password = form.get("password")?.toString();
    if (!username || !password) return showLoginMessage("Ievadiet lietotājvārdu un paroli.");
    const user = await databaseRequest("users", "readonly", (store) => store.get(username));
    if (!user || user.passwordHash !== await hashPassword(password)) return showLoginMessage("Nepareizs lietotājvārds vai parole.");
    sessionStorage.setItem("noliktava-user", user.username);
    loginMessage.hidden = true;
    renderDashboard(user);
  } catch {
    showLoginMessage("Nevarēja piekļūt lietotāju datubāzei. Pārbaudiet, vai lapa tiek atvērta caur localhost.");
  }
});

const savedUser = sessionStorage.getItem("noliktava-user");
if (savedUser) databaseRequest("users", "readonly", (store) => store.get(savedUser)).then((user) => user && renderDashboard(user));
