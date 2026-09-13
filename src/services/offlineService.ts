const DB_NAME = 'gospelstream-offline';
const STORE = 'media';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB unavailable'));
  });
}

export async function cacheDirectMedia(id: string, url: string, onProgress?: (value: number) => void) {
  if (typeof window === 'undefined' || !('indexedDB' in window)) throw new Error('Offline storage is unavailable on this device.');
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok || !response.body) throw new Error('The media server did not permit offline caching.');
  const total = Number(response.headers.get('content-length') || 0);
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) { chunks.push(value); received += value.byteLength; if (total) onProgress?.(Math.round(received / total * 100)); }
  }
  const blob = new Blob(chunks);
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Could not save offline media'));
  });
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
    return blob ? URL.createObjectURL(blob) : null;
  } catch { return null; }
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
  } catch { /* best effort */ }
}
