//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

/**
 * A simple key/value storage.
 */
export interface Storage {
    /** Adds a value to storage. */
    set (key: string, value: unknown): Promise<void>;

    /** Gets a value from storage. */
    get (key: string): Promise<unknown>;

    /** Removes a key from storage. */
    remove (key: string): Promise<void>;
}
