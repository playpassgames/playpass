
const configCache: { [key: string]: any } = {};

/**
 * Simple interface for fetching configuration files that a game may have.
 * 
 * Configuration files are static content served from the /config path
 */
export interface Configuration {
    /** 
     * Fetches a configuration file from the game files.
     * 
     * Results are cached, so it is safe to call this multiple times.
     */
    get (key: string): Promise<unknown>;
}

export const config: Configuration = {
    async get(key: string): Promise<Object | string | null> {
        if (key in configCache) {
            return configCache[key];
        }

        let result: any = null;
        const response = await fetch(`/config/${key}`);
        if (!response.ok) {
            result = null;
        } else if (key.endsWith('.json')) {
            result = response.json();
        } else {
            result = response.text();
        }

        configCache[key] = result;
        return result;
    }
};
