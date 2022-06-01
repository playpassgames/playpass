//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { requireToken } from "./auth";
import PlaypassClient from "./playpass-client";
import {loadConfig} from "./config";
import path from "path";
import kleur from "kleur";

export async function getDomain(opts: { game?: string }): Promise<void> {
    let gameId;
    if (opts.game) {
        gameId = opts.game;
    } else {
        const config = await loadConfig(path.join(process.cwd(), "playpass.toml"));
        gameId = config.game_id;
    }

    const token = await requireToken();
    const playpassClient = new PlaypassClient(token);

    const customDomain = await playpassClient.getCustomDomain(gameId);

    const status = customDomain.distributionDeployed ? kleur.green("✔") : kleur.yellow("Deploying...");
    console.log(`${customDomain.customDomain.domain} | ${customDomain.distributionDomainName} ${status}`);
}