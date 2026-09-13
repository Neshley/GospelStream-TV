const DB_NAME = 'gospelstream-offline';
const STORE = 'media';
const MAX_DOWNLOAD_BYTES = 750 * 1024 * 1024;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB unavailable'));
  });
}

export async function cacheDirectMedia(id: string, url: string, onProgress?: (value: number) => void) {
  if (typeof window === 'undefined' || !('indexedDB' in window)) throw new Error('Offline storage is unavailable on this device.');
  if (!/^https?:\/\//i.test(url)) throw new Error('This media source cannot be cached offline.');

  const estimate = await navigator.storage?.estimate?.();
  if (estimate?.quota && estimate?.usage && estimate.quota - estimate.usage < 10 * 1024 * 1024) {
    throw new Error('This device is low on browser storage. Remove an offline download and try again.');
  }

  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok || !response.body) throw new Error('The media server did not permit offline caching.');
  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > MAX_DOWNLOAD_BYTES) throw new Error('This media file is too large for the offline cache (750 MB limit).');

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      received += value.byteLength;
      if (received > MAX_DOWNLOAD_BYTES) {
        await reader.cancel();
        throw new Error('This media file is too large for the offline cache (750 MB limit).');
      }
      chunks.push(value);
      if (contentLength) onProgress?.(Math.min(99, Math.round(received / contentLength * 100)));
    }
  } finally {
    reader.releaseLock();
  }

  const blob = new Blob(chunks);
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Could not save offline media'));
    tx.onabort = () => reject(tx.error || new Error('Offline storage quota exceeded'));
  });
  db.close();
  onProgress?.(100);
  return { sizeMb: Number((blob.size / 1024 / 1024).toFixed(1)) };
}

export async function getCachedMediaUrl(id: string): Promise<string | null> {
  try {
    const db = await openDb();
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return blob ? URL.createObjectURL(blob) : null;
  } catch { return null; }
}

export async function hasCachedMedia(id: string): Promise<boolean> {
  try {
    const db = await openDb();
    const exists = await new Promise<boolean>((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getKey(id);
      req.onsuccess = () => resolve(req.result !== undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return exists;
  } catch { return false; }
}

export async function listCachedMediaIds(): Promise<string[]> {
  try {
    const db = await openDb();
    const ids = await new Promise<string[]>((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAllKeys();
      req.onsuccess = () => resolve(req.result.map(String));
      req.onerror = () => reject(req.error);
    });
    db.close();
    return ids;
  } catch { return []; }
}

export async function deleteCachedMedia(id: string) {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch { /* best effort */ }
}
