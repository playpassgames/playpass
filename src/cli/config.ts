//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import fs from "fs/promises";
import toml from "@iarna/toml";
import {isError} from "./utils";

export type Config = {
    game_id: string;
};

async function readFile (file: string) {
    try {
        return await fs.readFile(file, "utf8");
    } catch (error: unknown) {
        if (!isError(error) || error.code != "ENOENT") {
            throw error;
        }
        throw new Error(`Configuration file playpass.toml could not be found. Expected at: ${file}`);
    }
}

export async function loadConfig (file: string): Promise<Config> {
    const config = toml.parse(await readFile(file)) as Config;

    // Later we'll do schema validation using a library, for now check our one field manually
    if (!config.game_id || typeof config.game_id != "string") {
        throw new Error("playpass.toml is missing a required field: game_id");
    }

    return config;
}
