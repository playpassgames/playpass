//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import kleur from "kleur";
import {requireToken} from "./auth";
import PlaypassClient from "./playpass-client";
import fs from "fs/promises";
import * as path from "path";
import {loadConfig} from "./config";

export async function domain(domain: string, opts: {certificate: string, privateKey: string, certificateChain?: string, game?: string}): Promise<void> {
    let gameId;
    if (opts.game) {
        gameId = opts.game;
    } else {
        const config = await loadConfig(path.join(process.cwd(), "playpass.toml"));
        gameId = config.game_id;
    }

    const token = await requireToken();
    const playpassClient = new PlaypassClient(token);

    const certificate = await fs.readFile(path.resolve(opts.certificate), {encoding: "base64"});
    const privateKey = await fs.readFile(path.resolve(opts.privateKey), {encoding: "base64"});
    let chain;
    if (opts.certificateChain) {
        chain = await fs.readFile(path.resolve(opts.certificateChain), {encoding: "base64"});
    }

    const result = await playpassClient.customDomain(gameId, domain, certificate, privateKey, chain);

    const status = result.distributionDeployed ? kleur.green("✔") : kleur.yellow("Deploying...");
    console.log(`${kleur.green("✔")} Custom domain successfully created`);
    console.log(`Distribution URL: ${result.distributionDomainName} ${status}`);
    console.log(`Please create an alias record that points to ${result.distributionDomainName} in your DNS provider.`);
}
