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
  showView("home");
  loginView.hidden = true;
  dashboard.hidden = false;
}

function createMenuItem([label, iconName, action]) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.href = "#";
  link.dataset.action = action;
  link.append(createIcon(iconName), document.createTextNode(label));
  link.addEventListener("click", (event) => {
    event.preventDefault();
    action === "logout" ? logOut() : showView(action);
  });
  item.append(link);
  return item;
}

function showView(action) {
  const view = $("#dashboardView");
  view.replaceChildren();
  const title = document.createElement("h3");
  title.textContent = ({
    home: "Sākums",
    addProduct: "Pievienot produktu",
    addUser: "Pievienot lietotāju",
    users: "Lietotāji",
    orders: "Pasūtījumi",
    products: "Preces",
    data: "Datu pārvaldība",
    report: "Pārskats",
    locations: "Datu ievade"
  })[action] || "Sākums";
  view.append(title);
  if (action === "home") return;
  if (action === "addProduct") return renderProductForm(view);
  if (action === "addUser") {
    const link = document.createElement("a");
    link.href = "REGISTER.html";
    link.textContent = "Atvērt reģistrācijas lapu";
    view.append(link);
    return;
  }
  if (action === "users") return loadUsers(view);
  if (action === "orders") return renderOrderView(view);
  if (action === "products") return loadProducts(view);
  if (action === "data") return loadDataManagement(view);
  if (action === "report") return loadReport(view);
  if (action === "locations") return renderLocationView(view);
}

function formField(name, type, placeholder) {
  const input = document.createElement("input");
  input.name = name;
  input.type = type;
  input.placeholder = placeholder;
  input.required = true;
  if (type === "number") input.min = "0";
  return input;
}

function createForm(fields, buttonText, submit) {
  const form = document.createElement("form");
  form.className = "data-form";
  fields.forEach((field) => form.append(formField(...field)));
  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = buttonText;
  form.append(button);
  form.addEventListener("submit", submit);
  return form;
}

function renderProductForm(view) {
  view.append(createForm([["name", "text", "Preces nosaukums"], ["quantity", "number", "Daudzums"]], "Pievienot", saveProduct));
}

function renderOrderView(view) {
  view.append(createForm([["product", "text", "Prece"], ["quantity", "number", "Daudzums"]], "Izveidot pasūtījumu", saveOrder));
  loadOrders(view);
}

function renderLocationView(view) {
  view.append(createForm([["product", "text", "Prece"], ["shelf", "text", "Plaukta vieta"]], "Saglabāt", saveLocation));
  loadLocations(view);
}

async function saveProduct(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  data.quantity = Number(data.quantity);
  await databaseRequest("products", "readwrite", (store) => store.add(data));
  event.target.reset();
  showView("addProduct");
}

async function saveOrder(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  data.quantity = Number(data.quantity);
  data.status = "Jauns";
  await databaseRequest("orders", "readwrite", (store) => store.add(data));
  showView("orders");
}

async function saveLocation(event) {
  event.preventDefault();
  await databaseRequest("locations", "readwrite", (store) => store.add(Object.fromEntries(new FormData(event.target))));
  showView("locations");
}

function renderList(view, items, format) {
  const list = document.createElement("ul");
  list.className = "data-list";
  items.forEach((item) => {
    const row = document.createElement("li");
    row.textContent = format(item);
    list.append(row);
  });
  view.append(list);
}

async function loadUsers(view) {
  const users = await databaseRequest("users", "readonly", (store) => store.getAll());
  const list = document.createElement("ul");
  list.className = "data-list";
  users.forEach((user) => {
    const row = document.createElement("li");
    row.textContent = user.username;
    const role = document.createElement("select");
    Object.entries(ROLES).forEach(([key, value]) => role.add(new Option(value.label, key, key === user.role, key === user.role)));
    const save = document.createElement("button");
    save.className = "list-action";
    save.textContent = "Saglabāt";
    save.addEventListener("click", async () => {
      user.role = role.value;
      await databaseRequest("users", "readwrite", (store) => store.put(user));
      loadUsers(view);
    });
    row.append(" — ", role, save);
    list.append(row);
  });
  view.append(list);
}

async function loadOrders(view) {
  const orders = await databaseRequest("orders", "readonly", (store) => store.getAll());
  const list = document.createElement("ul");
  list.className = "data-list";
  orders.forEach((order) => {
    const row = document.createElement("li");
    row.textContent = `${order.product} (${order.quantity}) — `;
    const status = document.createElement("select");
    ["Jauns", "Apstrādē", "Pabeigts"].forEach((value) => status.add(new Option(value, value, value === order.status, value === order.status)));
    const save = document.createElement("button");
    save.className = "list-action";
    save.textContent = "Saglabāt";
    save.addEventListener("click", async () => {
      order.status = status.value;
      await databaseRequest("orders", "readwrite", (store) => store.put(order));
      loadOrders(view);
    });
    row.append(status, save);
    list.append(row);
  });
  view.append(list);
}

async function loadProducts(view) {
  const products = await databaseRequest("products", "readonly", (store) => store.getAll());
  renderList(view, products, (product) => `${product.name} — ${product.quantity}`);
}

async function loadDataManagement(view) {
  const products = await databaseRequest("products", "readonly", (store) => store.getAll());
  view.querySelector(".data-list")?.remove();
  const list = document.createElement("ul");
  list.className = "data-list";
  products.forEach((product) => {
    const row = document.createElement("li");
    row.textContent = `${product.name} — ${product.quantity}`;
    const edit = document.createElement("button");
    edit.className = "list-action";
    edit.textContent = "Rediģēt";
    edit.addEventListener("click", async () => {
      const quantity = Number(prompt("Daudzums:", product.quantity));
      if (!Number.isInteger(quantity) || quantity < 0) return;
      await databaseRequest("products", "readwrite", (store) => store.put({ ...product, quantity }));
      loadDataManagement(view);
    });
    const remove = document.createElement("button");
    remove.className = "list-action";
    remove.textContent = "Dzēst";
    remove.addEventListener("click", async () => {
      await databaseRequest("products", "readwrite", (store) => store.delete(product.id));
      loadDataManagement(view);
    });
    row.append(edit, remove);
    list.append(row);
  });
  view.append(list);
}

async function loadLocations(view) {
  const locations = await databaseRequest("locations", "readonly", (store) => store.getAll());
  renderList(view, locations, (item) => `${item.product} — ${item.shelf}`);
}

async function loadReport(view) {
  const [products, orders, locations] = await Promise.all([
    databaseRequest("products", "readonly", (store) => store.getAll()),
    databaseRequest("orders", "readonly", (store) => store.getAll()),
    databaseRequest("locations", "readonly", (store) => store.getAll())
  ]);
  renderList(view, [{ label: "Preces", count: products.length }, { label: "Pasūtījumi", count: orders.length }, { label: "Izvietojumi", count: locations.length }], (item) => `${item.label}: ${item.count}`);
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
  try {
    const form = new FormData(loginForm);
    const username = form.get("username")?.toString().trim().toLowerCase();
    const password = form.get("password")?.toString();
    if (!username || !password) return showLoginMessage("Ievadiet lietotājvārdu un paroli.");
    const user = await databaseRequest("users", "readonly", (store) => store.get(username));
    if (!user || user.passwordHash !== await hashPassword(password)) return showLoginMessage("Nepareizs lietotājvārds vai parole. Ja izmantojat localhost, reģistrējieties vēlreiz localhost lapā.");
    sessionStorage.setItem("noliktava-user", JSON.stringify({ username: user.username, role: user.role }));
    renderDashboard(user);
  } catch {
    showLoginMessage("Nevarēja piekļūt lietotāju datubāzei. Pārbaudiet, vai lapa tiek atvērta caur localhost.");
  }
});

$("#logoutButton").addEventListener("click", logOut);
const savedUser = JSON.parse(sessionStorage.getItem("noliktava-user") || "null");
if (savedUser) renderDashboard(savedUser);
