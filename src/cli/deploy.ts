//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import kleur from "kleur";
import archiver, {EntryData, ProgressData} from "archiver";
import * as path from "path";
import bytes from "bytes";
import fetch from "cross-fetch";

import {requireToken} from "./auth";
import {loadConfig} from "./config";
import PlaypassClient from "./playpass-client";
import readline from "readline";

// TODO(2022-02-22): Put this in a project config or infer
const PUBLISH_DIR = path.join(process.cwd(), "dist");

function packageDir(publishDir: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        let files = 0;
        let indexFound = false;
        const archive = archiver("zip");
        const chunks: Buffer[] = [];

        archive.on("data", data => {
            chunks.push(data);
        });
        archive.on("entry", (entryData: EntryData) => {
            if (entryData.name === "index.html") {
                indexFound = true;
            }
        });
        archive.on("progress", (progress: ProgressData) => {
            files++;
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`Processed ${progress.entries.processed} files with ${bytes(progress.fs.processedBytes)}...`);
        });
        archive.on("end", () => {
            console.log();
            if (files <= 0) {
                reject(`No files found in ${publishDir}. Try running 'npm run build' again.`);
                return;
            }
            if (!indexFound) {
                reject(`Index file not found at ${publishDir}. Try running 'npm run build' again.`);
                return;
            }
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

export async function deploy(opts: { prefix?: string }): Promise<void> {
    const config = await loadConfig(path.join(process.cwd(), "playpass.toml"));

    const token = await requireToken();
    const playpassClient = new PlaypassClient(token);

    console.log("Uploading game...");

    let archivedFile;
    try {
        archivedFile = await packageDir(PUBLISH_DIR);
    } catch (e: unknown) {
        throw new Error(`Failed to archive game: ${e}`);
    }

    if (archivedFile.length > bytes("150mb")) {
        throw new Error(`Package exceeds the 150mb limit: ${bytes(archivedFile.length)}`);
    }

    // console.log(`Package created ${bytes(archivedFile.length)}`);

    const deployment = await playpassClient.upload(config.game_id, opts.prefix);
    const response = await fetch(deployment.uploadUrl, {
        method: "PUT",
        body: archivedFile
    });

    if (response.status != 200) {
        const text = await response.text();
        throw new Error(text);
    }

    // TODO: progress bar
    if (deployment.customDomain) {
        const status = deployment.customDomain.distributionDeployed ? kleur.green("✔") : kleur.yellow("Deploying...");
        console.log(`${status} Distribution URL: ${deployment.customDomain.distributionDomainName}`);
        console.log(`Please create an alias record that points to ${deployment.customDomain.distributionDomainName} in your DNS provider.`);
    }

    console.log(`${kleur.green("✔")} Deployed to https://${deployment.gameUrl}`);
}
