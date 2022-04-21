//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { ReplicantLite } from "@playpass/replicant-lite";

import { IDBStorage } from "./idb-storage";
import type { Storage } from "./storage";

/**
 * A storage backed by replicant, or in browser local storage while the user doesn't have an
 * account. After registering an account, any progress is transfered to the replicant backend.
 */
export class CloudStorage implements Storage {
    private replicantClient?: ReplicantLite;

    constructor (private localStorage: IDBStorage) {
    }

    async onLogin (replicantClient: ReplicantLite) {
        this.replicantClient = replicantClient;

        // If any replicant data already exists for this player, assume we can't safely transfer any
        // local progress and bail early
        for (const key in replicantClient.storage.get()) {
            return;
        }

        // Transfer any local data into replicant
        const newProperties: Record<string,unknown> = {};
        for (const key of await this.localStorage.getAllKeys()) {
            const value = await this.localStorage.get(key);
            newProperties[key] = value;
        }
        await replicantClient.storage.set(newProperties);

        // We don't need the local data any more
        void this.localStorage.clear();
    }

    set (key: string, value: unknown): Promise<void> {
        return (this.replicantClient && this.replicantClient.isLoggedIn())
            ? this.replicantClient.storage.set({ [key]: value })
            : this.localStorage.set(key, value);
    }

    get (key: string): Promise<unknown> {
        return (this.replicantClient && this.replicantClient.isLoggedIn())
            ? Promise.resolve(this.replicantClient.storage.get()[key])
            : this.localStorage.get(key);
    }

    remove (key: string): Promise<void> {
        return (this.replicantClient && this.replicantClient.isLoggedIn())
            ? this.replicantClient.storage.remove([key])
            : this.localStorage.remove(key);
    }
}
