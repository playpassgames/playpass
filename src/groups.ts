//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { Storage } from "./storage";
import { randomId } from "./utils";
import { replicantClient } from "./login";

const getGroupCache = new Map<string,Promise<Group>>();

/** A group can be created with {@link createGroup} or {@link getGroup}. */
export interface Group {
    /** The group's shared storage. */
    readonly storage: Storage;

    /** The group ID that can be used to access this group with {@link getGroup}. */
    readonly groupId: string;

    /** The player IDs that have ever written to this group's storage. */
    readonly players: Set<string>;
}

class StorageImpl implements Storage {
    constructor (private readonly group: Group, private readonly cache: Record<string,unknown>) {
    }

    set (key: string, value: unknown): Promise<void> {
        // Write the value to our local cache
        this.cache[key] = value;

        // Make sure our own user ID is now in the list of writers
        this.group.players.add(replicantClient!.getUserId()!);

        return replicantClient!.groups.setStorage(this.group.groupId, { [key]: value });
    }

    get (key: string): Promise<unknown> {
        return Promise.resolve(this.cache[key]);
    }

    remove (key: string): Promise<void> {
        return this.set(key, undefined);
    }
}

class GroupImpl implements Group {
    readonly storage: StorageImpl;
    readonly players: Set<string>;

    constructor (public readonly groupId: string, players: string[], storage: Record<string,unknown>) {
        this.players = new Set(players);
        this.storage = new StorageImpl(this, storage);
    }
}

/** Gets an existing group. */
export async function getGroup (groupId: string): Promise<Group> {
    let request = getGroupCache.get(groupId);
    if (!request) {
        request = new Promise((resolve, reject) => {
            replicantClient!.groups.fetch(groupId).then(groupData => {
                if (!groupData) {
                    throw new Error(`Group with ID "${groupId}" does not exist`);
                }
                resolve(new GroupImpl(groupId, groupData.members, groupData.storage));
            }).catch(reject);
        });
        getGroupCache.set(groupId, request);
    }
    return request;
}

/** Creates a new group. */
export async function createGroup (): Promise<Group> {
    const groupId = await replicantClient!.groups.create();
    const group = new GroupImpl(groupId, [], {});
    getGroupCache.set(groupId, Promise.resolve(group));
    return group;
}
