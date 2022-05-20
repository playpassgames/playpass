//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import copy from "recursive-copy";
import fs from "fs/promises";
import path from "path";
import prompts from "prompts";
import type { PromptObject } from "prompts";
import kleur from "kleur";
import degit from "degit";
import replace from "replace";

import { slugify, npm, exists } from "./utils";
import { requireToken } from "./auth";
import PlaypassClient from "./playpass-client";
import { playpassHost } from "./config";

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

export async function create (destDir: string | undefined, opts: { template?: string, local?: boolean }): Promise<void> {
    let subdomain: string;

    // Whether we're creating using a template, or in-place adding Playpass to an existing project
    let useTemplate = true;
    let gameId = "YOUR_GAME_ID";

    if (!destDir) {
        // No directory param provided, prompt them for a project ID and use it to form the dest dir
        subdomain = slugify(await prompt({
            type: "text",
            message: "What will we call your project?",
            initial: "my-game",
        }));

        if (await exists(process.cwd()+"/package.json")) {
            useTemplate = !await prompt({
                type: "confirm",
                message: "This directory already contains a package.json, should we use it as an existing project?",
                initial: true,
            });
        }

        destDir = useTemplate ? path.resolve(subdomain) : process.cwd();

    } else {
        // They provided a dest dir, infer the project ID from it and make sure it's absolute
        subdomain = slugify(path.basename(destDir));
        destDir = path.resolve(destDir);
    }

    // when the local flag is set, we do not need to reserve resources in playpass cloud
    // In order to claim an id and deploy the game, the developer will have to rerun
    //   `playpass create` on their existing game
    if (!opts.local) {
        const token = await requireToken();
        const playpassClient = new PlaypassClient(token);
        try {
            await playpassClient.checkGame(subdomain);
            console.error(`Subdomain ${subdomain}.${playpassHost} already exists. Please use a different name.`);
            return;
        } catch (e) {
            // Continue
        }

        try {
            const game = await playpassClient.create(subdomain);
            gameId = game.id;
        } catch (e) {
            throw new Error(`Failed to create game ${subdomain}, please try again`);
        }
    }

    if (useTemplate) {
        try {
            await fs.stat(destDir);
            console.error(`Directory ${destDir} already exists. Please use a different name.`);
            return;
        } catch (error) {
            // Continue
        }

        const template = opts.template || await prompt({
            type: "select",
            name: "template",
            message: "Choose a project template below",
            choices: [
                { title: "Daily Image Reveal Game", value: "github:playpassgames/daily-pixel-game-template" },
                { title: "Daily Images Game", value: "github:playpassgames/daily-image-game-template" },
                { title: "Daily Level Game", value: "github:playpassgames/playpass-game-template" },
                { title: "Daily Phrase Game", value: "github:playpassgames/daily-phrase-game-template" },
                { title: "Daily Word Game", value: "github:playpassgames/daily-word-game-template" },
            ],
        });

        // values with slashes in them are preceived as git urls
        if (template.indexOf("/") > 0) {
            console.log(`Downloading template from ${template}`);
            const git = degit(template, {});
            await git.clone(destDir);
        } else {
            const templatesDir = `${__dirname}/../../../templates`;
            await copy(`${templatesDir}/${template}`, destDir, { dot: true, junk: true });
            await copy(`${templatesDir}/common`, destDir, { dot: true, junk: true });
        }

        // Update package.json. This is only to have a sensible default and not used by Playpass
        const json = JSON.parse(await fs.readFile(destDir+"/package.json", "utf8"));
        json.name = subdomain;
        await fs.writeFile(destDir+"/package.json", JSON.stringify(json, null, "  "));
    }

    console.log("Installing NPM dependencies, this may take a minute...");

    await npm(["install", "playpass@latest", "--save"], {
        stdio: "ignore",
        cwd: destDir,
    });

    await replace({
        regex: "YOUR_GAME_ID",
        replacement: gameId,
        paths: [destDir],
        recursive: true,
    });

    // Generate an initial playpass.toml
    await fs.writeFile(destDir+"/playpass.toml", [
        "# Your game's unique identifier. This should never change.",
        `game_id = "${gameId}"`,
    ].join("\n") + "\n");

    console.log();

    if (useTemplate) {
        console.log(`${kleur.green("✔")} Created new project at ${destDir}`);
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
    } else {
        console.log(`${kleur.green("✔")} Added Playpass to an existing project at ${destDir}`);
        console.log();
        console.log("To start using Playpass, edit your main JS file to add this import:");
        console.log();
        console.log("    import * as playpass from \"playpass\";");
        console.log();
        console.log("And paste this line into your game's initialization:");
        console.log();
        console.log(`    await playpass.init({ gameId: "${gameId}" });`);
        console.log();
    }
}
