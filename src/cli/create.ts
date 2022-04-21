//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import copy from "recursive-copy";
import replace from "stream-replace";
import fs from "fs/promises";
import path from "path";
import prompts from "prompts";
import type { PromptObject } from "prompts";
import kleur from "kleur";

import { slugify, spawn } from "./utils";
import {requireToken} from "./auth";
import PlaypassClient from "./playpass-client";

async function prompt (obj: Partial<PromptObject>): Promise<string> {
    const { value } = await prompts({
        ...obj,
        name: "value",
    } as PromptObject, {
        onCancel () {
            process.exit(0);
        }
    });
    return value;
}

export async function create (destDir: string | undefined, opts: { template?: string }): Promise<void> {
    let projectId: string;

    if (!destDir) {
        // No directory param provided, prompt them for a project ID and use it to form the dest dir
        projectId = slugify(await prompt({
            type: "text",
            message: "What will we call your project?",
            initial: "my-game",
        }));
        destDir = path.resolve(projectId);

    } else {
        // They provided a dest dir, infer the project ID from it and make sure it's absolute
        projectId = slugify(path.basename(destDir));
        destDir = path.resolve(destDir);
    }

    const token = await requireToken();
    const playpassClient = new PlaypassClient(token);
    try {
        await playpassClient.checkGame(projectId);
        console.error(`Project ${projectId} already exists. Please use a different name.`);
        return;
    } catch (e) {
        // Continue
    }

    const template = opts.template || await prompt({
        type: "select",
        name: "template",
        message: "Choose a project template below",
        choices: [
            { title: "Daily Level Game", value: "daily-level" },
            { title: "React Daily Level Game", value: "react-daily-level" },
        ],
    });

    console.log();

    try {
        await fs.stat(destDir);
        console.error(`Directory ${destDir} already exists. Please use a different name.`);
        return;
    } catch (error) {
        // Continue
    }

    const transform = (src: string, dest: string) => {
        const ext = path.extname(src);
        if (ext != ".js" && ext != ".jsx" && ext != ".ts" && ext != ".tsx") {
            return null;
        }
        return replace("YOUR_PROJECT_ID", projectId);
    };

    const templatesDir = `${__dirname}/../../../templates`;
    await copy(`${templatesDir}/${template}`, destDir, { dot: true, transform });
    await copy(`${templatesDir}/common`, destDir, { dot: true });

    // Update package.json
    const json = JSON.parse(await fs.readFile(destDir+"/package.json", "utf8"));
    json.name = projectId;
    await fs.writeFile(destDir+"/package.json", JSON.stringify(json, null, "  "));

    console.log("Installing NPM dependencies, this may take a minute...");

    await spawn("npm", ["install", "playpass@latest", "--save"], {
        stdio: "ignore",
        cwd: destDir,
    });

    try {
        await playpassClient.create(projectId);
    } catch (e) {
        console.error(`Failed to create game ${projectId}`, e);
    }

    console.log();
    console.log(`${kleur.green("✔")} Created project at ${destDir}`);
    console.log();
    console.log("Develop it by running:");
    console.log();
    console.log("    npm start");
    console.log();
    console.log("Build for production by running:");
    console.log();
    console.log("    npm run build");
    console.log();
    console.log("Deploy it by pushing to GitHub, or manually running:");
    console.log();
    console.log("    playpass deploy");
    console.log();
}
