//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { Storage } from "./storage";
import { randomId } from "./utils";

/** @hidden A group can be created with {@link createGroup} or {@link getGroup}. */
export interface Group {
    /** The group's shared storage. */
    readonly storage: Storage;

    /** Gets the group ID that can be used to join this group. */
    getGroupId (): string;

    /** Gets a list of player IDs that have ever written to this group's storage. */
    getPlayers (): Promise<string>;
}

class StorageImpl implements Storage {
    constructor (private readonly groupId: string) {
    }

    set (key: string, value: unknown): Promise<void> {
        throw new Error("Not yet implemented");
    }

    get (key: string): Promise<unknown> {
        throw new Error("Not yet implemented");
    }

    remove (key: string): Promise<void> {
        throw new Error("Not yet implemented");
    }
}

class GroupImpl implements Group {
    storage: StorageImpl;

    constructor (private groupId: string) {
        this.storage = new StorageImpl(groupId);
    }

    getGroupId (): string {
        return this.groupId;
    }

    getPlayers (): Promise<string> {
        throw new Error("Not yet implemented");
    }
}

/** @hidden Gets an existing group. */
export function getGroup (groupId: string): Group {
    // TODO(2022-03-28): Validate group ID
    return new GroupImpl(groupId);
}

/** @hidden Creates a new group. */
export function createGroup (): Group {
    return new GroupImpl(randomId("group"));
}
