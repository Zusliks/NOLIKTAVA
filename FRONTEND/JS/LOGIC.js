import ROLES from "./ROLES.js";
import { databaseRequest as db, hashPassword } from "./AUTH.js";

const $ = (s) => document.querySelector(s);
const loginForm = $("#loginForm");
const msg = $("#loginMessage");
const STAT = ["Jauns", "Apstrādē", "Pabeigts"];
const STATE = ["Labā stāvoklī", "Bojāta", "Beigusies"];
const ICONS = {
  home: "M4 10l8-6 8 6v10h-5v-6H9v6H4z",
  plus: "M12 5v14M5 12h14",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0",
  order: "M2 6h12v10H2zM14 9h4l4 4v3h-8M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  report: "M3 21V4h10v17M13 9h8v12M2 21h20M6 8h4M6 12h4M6 16h4M16 13h2M16 17h2",
  placement: "M3 5h18v14H3zM6 9h6M6 13h6M15 9h3v6h-3z",
  logout: "M10 4H4v16h6M14 8l4 4-4 4M18 12H9"
};
let me = null, page = "home", box;

const all = (t) => db(t, "readonly", (s) => s.getAll());
const put = (t, x) => db(t, "readwrite", (s) => s.put(x));
const del = (t, k) => db(t, "readwrite", (s) => s.delete(k));
const roleList = () => Object.entries(ROLES).map(([k, r]) => [k, r.label]);
const again = () => go(page);

function h(tag, props = {}, ...kids) {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...kids);
  return n;
}

const btn = (text, fn) => h("button", { type: "button", className: "list-action", textContent: text, onclick: async () => { await fn(); again(); } });
const pick = (opts, val) => h("select", {}, ...(opts.length ? opts : [["", "Nav preču"]]).map(([v, t]) => new Option(t, v, false, v == val)));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

function rows(items, fn) {
  if (!items.length) return box.append(h("p", { className: "empty", textContent: "Nav ierakstu." }));
  box.append(h("ul", { className: "data-list" }, ...items.map((x) => h("li", {}, ...fn(x)))));
}
const sub = (t) => box.append(h("h4", { textContent: t }));

function form(fields, label, done) {
  const f = h("form", { className: "data-form" });
  for (const [name, hint, type] of fields) {
    const el = Array.isArray(type) ? pick(type) : h("input", { type, placeholder: hint, min: 0 });
    el.name = name;
    el.required = true;
    f.append(el);
  }
  f.append(h("button", { type: "submit", textContent: label }));
  f.onsubmit = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    for (const k in d) if (k == "quantity") d[k] = +d[k]; else if (k != "password") d[k] = d[k].trim();
    const err = await done(d);
    if (typeof err == "string") return alert(err);
    again();
  };
  box.append(f);
}

async function products(edit, drop) {
  rows(await all("products"), (p) => [
    `${p.name}: ${p.quantity} gab.`,
    ...(drop ? [btn("Dzēst", () => del("products", p.id))] : []),
    ...(edit ? [btn("Rediģēt", () => {
      const v = prompt("Daudzums:", p.quantity);
      if (/^\d+$/.test(v ?? "")) return put("products", { ...p, quantity: +v });
    })] : [])
  ]);
}

async function report() {
  const [prod, orders, locs] = await Promise.all(["products", "orders", "locations"].map((t) => all(t)));
  const shelf = (p) => locs.find((l) => l.product == p.name)?.shelf || "nav plauktā";
  sub("Preču stāvoklis");
  rows(prod, (p) => [`${p.name}: ${p.quantity} gab., ${shelf(p)}, ${p.state || STATE[0]}`]);
  sub("Pasūtījumi");
  rows(STAT, (s) => [`${s}: ${orders.filter((o) => o.status == s).length}`]);
  box.append(h("button", { type: "button", className: "list-action", textContent: "Drukāt", onclick: () => {
    const td = (r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join("")}</tr>`;
    const w = open("", "_blank");
    w.document.write(`<!doctype html><meta charset="utf-8"><title>Noliktavas atskaite</title>
<style>body{font-family:system-ui,sans-serif;margin:2rem;color:#172033}table{border-collapse:collapse;width:100%;margin-bottom:2rem}td,th{border:1px solid #c8d4e2;padding:.5rem;text-align:left}th{background:#eef3f8}button{padding:.6rem 1rem;margin-bottom:1rem}@media print{button{display:none}}</style>
<button onclick="print()">Drukāt</button>
<h1>Noliktavas atskaite</h1>
<p>${new Date().toLocaleString("lv-LV")}<br>Sagatavoja: ${esc(me.username)} (${ROLES[me.role].label})</p>
<h2>Preces</h2>
<table><tr><th>Prece</th><th>Daudzums</th><th>Plaukts</th><th>Stāvoklis</th></tr>${prod.map((p) => td([p.name, p.quantity, shelf(p), p.state || STATE[0]])).join("")}</table>
<h2>Pasūtījumi</h2>
<table><tr><th>Prece</th><th>Daudzums</th><th>Statuss</th></tr>${orders.map((o) => td([o.product, o.quantity, o.status])).join("")}</table>
<p>Kopā: ${prod.length} preces, ${orders.length} pasūtījumi (${STAT.map((s) => `${s}: ${orders.filter((o) => o.status == s).length}`).join(", ")})</p>`);
    w.document.close();
  } }));
}

const pages = {
  async home() {
    rows(ROLES[me.role].tasks, (t) => [t]);
    if (me.role == "ADMIN") return report();
    sub("Preces");
    await products(me.role == "WORKER");
  },
  async data() {
    form([["name", "Preces nosaukums", "text"], ["quantity", "Daudzums", "number"]], "Pievienot", async (d) => { await put("products", d); });
    await products(true, true);
  },
  register() {
    form([["username", "Lietotājvārds", "text"], ["password", "Parole", "password"], ["role", "", roleList()]], "Izveidot", async (d) => {
      d.username = d.username.toLowerCase();
      if (d.username.length < 3 || d.password.length < 6) return "Lietotājvārdam vajag 3, parolei 6 simbolus.";
      if (await db("users", "readonly", (s) => s.get(d.username))) return "Šāds lietotājs jau eksistē.";
      await put("users", { username: d.username, role: d.role, passwordHash: await hashPassword(d.password) });
      alert("Lietotājs izveidots.");
    });
  },
  async users() {
    rows(await all("users"), (u) => {
      if (u.username == me.username) return [`${u.username} (jūs), ${ROLES[u.role].label}`];
      const r = pick(roleList(), u.role);
      return [u.username, r, btn("Dzēst", () => del("users", u.username)), btn("Saglabāt", () => put("users", { ...u, role: r.value }))];
    });
  },
  async orders() {
    const prod = await all("products");
    form([["product", "", prod.map((p) => [p.name, p.name])], ["quantity", "Daudzums", "number"]], "Pasūtīt", async (d) => { await put("orders", { ...d, status: "Jauns" }); });
    rows(await all("orders"), (o) => {
      const s = pick(STAT.map((x) => [x, x]), o.status);
      return [`${o.product} (${o.quantity} gab.)`, s, btn("Saglabāt", () => put("orders", { ...o, status: s.value }))];
    });
  },
  async locations() {
    const [prod, locs] = await Promise.all([all("products"), all("locations")]);
    form([["product", "", prod.map((p) => [p.name, p.name])], ["shelf", "Plaukta vieta", "text"]], "Izvietot", async (d) => { await put("locations", { ...locs.find((l) => l.product == d.product), ...d }); });
    rows(locs, (l) => [`${l.product}: ${l.shelf}`]);
  },
  report,
  async stock() {
    const prod = await all("products");
    form([["product", "", prod.map((p) => [p.id, p.name])], ["state", "", STATE.map((x) => [x, x])]], "Saglabāt", async (d) => {
      const p = prod.find((x) => x.id == d.product);
      if (p) await put("products", { ...p, state: d.state });
    });
    rows(prod, (p) => {
      const s = pick(STATE.map((x) => [x, x]), p.state || STATE[0]);
      return [`${p.name}: ${p.quantity} gab.`, s, btn("Saglabāt", () => put("products", { ...p, state: s.value }))];
    });
  }
};

function go(key) {
  const menu = ROLES[me.role].menu;
  const [label, , k] = menu.find((m) => m[2] == key) || menu[0];
  page = k;
  box = h("div");
  $("#dashboardView").replaceChildren(h("h3", { textContent: label }), box);
  document.querySelectorAll("#sidebarNavigation a").forEach((a) => a.classList.toggle("active", a.dataset.go == k));
  pages[k]();
}

function link([label, ic, k]) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "menu-icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.innerHTML = `<path d="${ICONS[ic]}"/>`;
  const a = h("a", { href: "#" }, svg, label);
  a.dataset.go = k;
  a.onclick = (e) => { e.preventDefault(); k == "logout" ? logout() : go(k); };
  return h("li", {}, a);
}

function enter(user) {
  if (!ROLES[user.role]) return;
  me = user;
  $("#userName").textContent = user.username;
  $("#roleName").textContent = ROLES[user.role].label;
  $("#sidebarNavigation").replaceChildren(...[...ROLES[user.role].menu, ["Iziet", "logout", "logout"]].map(link));
  go("home");
  $("#loginView").hidden = true;
  $("#dashboard").hidden = false;
}

function logout() {
  sessionStorage.removeItem("noliktava-user");
  me = null;
  $("#dashboard").hidden = true;
  $("#loginView").hidden = false;
  loginForm.reset();
}

function oops(text) {
  msg.textContent = text;
  msg.className = "message error";
  msg.hidden = false;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const f = new FormData(loginForm);
    const name = f.get("username")?.toString().trim().toLowerCase();
    const pass = f.get("password")?.toString();
    if (!name || !pass) return oops("Ievadiet lietotājvārdu un paroli.");
    const user = await db("users", "readonly", (s) => s.get(name));
    if (!user || user.passwordHash !== await hashPassword(pass)) return oops("Nepareizs lietotājvārds vai parole.");
    sessionStorage.setItem("noliktava-user", user.username);
    msg.hidden = true;
    enter(user);
  } catch (err) {
    console.error(err);
    oops("Nevarēja piekļūt lietotāju datubāzei.");
  }
});

const saved = sessionStorage.getItem("noliktava-user");
if (saved) db("users", "readonly", (s) => s.get(saved)).then((u) => u && enter(u)).catch(console.error);
