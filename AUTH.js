const database = new Promise((resolve, reject) => {
  const request = indexedDB.open("noliktava-db", 1);
  request.onupgradeneeded = () => request.result.createObjectStore("users", { keyPath: "username" });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export function databaseRequest(mode, operation) {
  return database.then((db) => new Promise((resolve, reject) => {
    const request = operation(db.transaction("users", mode).objectStore("users"));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }));
}

export async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
