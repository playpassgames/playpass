//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import kleur from "kleur";
import * as path from "path";

import { requireToken } from "./auth";
import { loadConfig } from "./config";
import PlaypassClient from "./playpass-client";

export async function invite(opts: { userId: string }): Promise<void> {
    const config = await loadConfig(path.join(process.cwd(), "playpass.toml"));

    const token = await requireToken();
    const playpassClient = new PlaypassClient(token);

    // console.log(`Package created ${bytes(archivedFile.length)}`);

    const response = await playpassClient.invite(config.game_id, opts.userId);

    if (response.result) {
        throw new Error('Unable to add user to team');
    }

    console.log(`${kleur.green("✔")} Added ${opts.userId} to team`);
}
