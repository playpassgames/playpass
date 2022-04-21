//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import kleur from "kleur";
import {requireToken} from "./auth";
import PlaypassClient from "./playpass-client";
import fs from "fs/promises";
import * as path from "path";

export async function domain(domains: string[], opts: {certificate: string, privateKey: string, certificateChain?: string}): Promise<void> {
    const token = await requireToken();
    const playpassClient = new PlaypassClient(token);

    const certificate = await fs.readFile(path.resolve(opts.certificate), {encoding: "base64"});
    const privateKey = await fs.readFile(path.resolve(opts.privateKey), {encoding: "base64"});
    let chain;
    if (opts.certificateChain) {
        chain = await fs.readFile(path.resolve(opts.certificateChain), {encoding: "base64"});
    }

    let result;
    try {
        result = await playpassClient.customDomain(domains, certificate, privateKey, chain);
    } catch (e: any) {
        console.log(`Failed to create custom domain: ${e.message}`);
        return;
    }

    console.log(`${kleur.green("✔")} Custom domain successfully created: ${JSON.stringify(result?.id)}`);
}