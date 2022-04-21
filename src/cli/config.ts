//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import fs from "fs/promises";
import toml from "@iarna/toml";

export type Config = {
    game_id: string;
};

export async function loadConfig (file: string): Promise<Config> {
    const config = toml.parse(await fs.readFile(file, "utf8")) as Config;

    // Later we'll do schema validation using a library, for now check our one field manually
    if (!config.game_id || typeof config.game_id != "string") {
        throw new Error("playpass.toml is missing a required field: game_id");
    }

    return config;
}
