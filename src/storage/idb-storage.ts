//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import type { Storage } from "./storage";

function toPromise<T> (request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}

export class IDBStorage implements Storage {
    constructor (private internal: boolean) {
    }

    set (key: string, value: unknown): Promise<void> {
        return this.callStore("readwrite", store => store.put(value, key)) as Promise<void>;
    }

    get (key: string): Promise<unknown> {
        return this.callStore("readonly", store => store.get(key));
    }

    getAllKeys (): Promise<string[]> {
        return this.callStore("readonly", store => store.getAllKeys()) as Promise<string[]>;
    }

    clear (): Promise<void> {
        return this.callStore("readwrite", store => store.clear()) as Promise<void>;
    }

    remove (key: string): Promise<void> {
        return this.callStore("readwrite", store => store.delete(key)) as Promise<void>;
    }

    private async callStore (mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<unknown> {
        const open = indexedDB.open("Playpass", 1);
        open.onupgradeneeded = () => {
            const db = open.result;
            db.createObjectStore("Internal");
            db.createObjectStore("Game");
        };
        const db = await toPromise(open);

        const storeName = this.internal ? "Internal" : "Game";
        const store = db.transaction(storeName, mode).objectStore(storeName);

        // This callback cannot be async, otherwise the transaction might close early! The store
        // should be considered valid only for the current frame.
        const request = fn(store);

        const result = await toPromise(request);
        db.close();
        return result;
    }
}
