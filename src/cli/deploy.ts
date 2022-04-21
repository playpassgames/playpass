//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import kleur from "kleur";
import archiver from "archiver";
import fs from "fs/promises";
import * as path from "path";
import bytes from "bytes";
import fetch from "cross-fetch";

import {requireToken} from "./auth";
import {slugify} from "./utils";
import PlaypassClient from "./playpass-client";

// TODO(2022-02-22): Put this in a project config or infer
const PUBLISH_DIR = path.join(process.cwd(), "dist");

function packageDir(publishDir: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const archive = archiver("zip");
        const chunks: Buffer[] = [];

        archive.on("data", data => {
            chunks.push(data);
        });
        archive.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        archive.on("error", reject);

        archive.glob("**/*", {
            cwd: publishDir,
            ignore: [".*", "playpass.toml"],
        });
        archive.finalize();
    });
}

export async function deploy(opts: { prefix?: string, customDomain?: string }): Promise<void> {
    const json = JSON.parse(await fs.readFile(path.join(process.cwd(), "package.json"), "utf8"));

    if (!json.gameId && !json.name) {
        throw new Error("Missing name field from package.json");
    }
    const gameId = json.gameId ?? json.name;

    const token = await requireToken();
    const playpassClient = new PlaypassClient(token);
    const games = await playpassClient.getGames();
    const game = games.find(a => a.id === gameId);
    if (!game) {
        throw new Error(`Game with id ${gameId} does not exist.`);
    }

    const subdomain = opts.prefix ? `${slugify(opts.prefix)}--${game.name}` : game.name;

    console.log(`Uploading ${game.name}...`);

    const archivedFile = await packageDir(PUBLISH_DIR);

    if (archivedFile.length > bytes("150mb")) {
        throw new Error(`Package exceeds the 150mb limit: ${bytes(archivedFile.length)}`);
    }

    // console.log(`Package created ${bytes(archivedFile.length)}`);

    const deployment = await playpassClient.upload(gameId, opts.prefix, opts.customDomain);
    const response = await fetch(deployment.uploadUrl, {
        method: "PUT",
        body: archivedFile
    });

    if (response.status != 200) {
        const text = await response.text();
        throw new Error(text);
    }

    // TODO: progress bar
    if (deployment.distributionDomainName) {
        console.log(`${kleur.green("✔")} Distribution URL: ${deployment.distributionDomainName}`);
        console.log("Please create an alias record that points to it in your DNS provider.");
    }

    console.log(`${kleur.green("✔")} Deployed to https://${subdomain}.playpass.games`);
}
