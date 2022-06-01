//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { requireToken } from "./auth";
import PlaypassClient from "./playpass-client";
import kleur from "kleur";
import {loadConfig} from "./config";
import path from "path";

export async function deleteDomain(opts: { game?: string }): Promise<void> {
    let gameId;
    if (opts.game) {
        gameId = opts.game;
    } else {
        const config = await loadConfig(path.join(process.cwd(), "playpass.toml"));
        gameId = config.game_id;
    }

    const token = await requireToken();
    const playpassClient = new PlaypassClient(token);

    await playpassClient.deleteDomain(gameId);

    console.log(`${kleur.green("✔")} Successfully deleted custom domain for game ${gameId}`);
}