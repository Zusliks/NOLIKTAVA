const database = new Promise((resolve, reject) => {
  const request = indexedDB.open("noliktava-db", 2);
  request.onupgradeneeded = () => {
    const database = request.result;
    for (const [name, key] of [["users", "username"], ["products", "id"], ["orders", "id"], ["locations", "id"]]) {
      if (!database.objectStoreNames.contains(name)) database.createObjectStore(name, { keyPath: key, autoIncrement: key === "id" });
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export function databaseRequest(storeName, mode, operation) {
  return database.then((db) => new Promise((resolve, reject) => {
    const request = operation(db.transaction(storeName, mode).objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }));
}

export async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
