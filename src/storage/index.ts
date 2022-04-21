//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { Storage } from "./storage";
import { CloudStorage } from "./cloud-storage";
import { IDBStorage } from "./idb-storage";

export type { Storage } from "./storage";

export const cloudStorage = new CloudStorage(new IDBStorage(false));

/** Game data storage. */
export const storage: Storage = cloudStorage; 

/** Playpass SDK internal storage. */
export const internalStorage: Storage = new IDBStorage(true);
