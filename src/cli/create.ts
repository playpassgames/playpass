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

import { slugify, npm, exists, invalidSubdomain } from "./utils";
import { requireToken } from "./auth";
import PlaypassClient from "./playpass-client";
import { playpassHost } from "./config";
import { templates } from "./templates.json";

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

export async function create (destDir: string | undefined, opts: { name?: string, template?: string, local?: boolean }): Promise<void> {
    let subdomain: string;

    // Whether we're creating using a template, or in-place adding Playpass to an existing project
    let useTemplate = true;
    let gameId = "YOUR_GAME_ID";

    if (!destDir) {
        // No directory param provided, prompt them for a project ID and use it to form the dest dir
        subdomain = slugify(opts.name ?? await prompt({
            type: "text",
            message: "What will we call your project?",
            initial: "my-game",
        }));

        destDir = opts.name ? process.cwd() : path.resolve(subdomain);
    } else {
        // They provided a dest dir, infer the project ID from it and make sure it's absolute
        subdomain = slugify(opts.name ?? path.basename(destDir));
        destDir = path.resolve(destDir);
    }

    // Only allow 'safe' domain names
    if (invalidSubdomain(subdomain)) {
        console.log(`\n${kleur.bold().red(`Derived subdomain '${subdomain}' is not allowed, please try again.`)}`);
        return Promise.resolve();
    }

    console.log(`New playpass project ${subdomain} will be created in ${destDir}`);

    if (await exists(path.resolve(destDir, "package.json"))) {
        useTemplate = !await prompt({
            type: "confirm",
            message: "This directory already contains a package.json, should we use it as an existing project?",
            initial: true,
        });
    }

    // when the local flag is set, we do not need to reserve resources in playpass cloud
    // In order to claim an id and deploy the game, the developer will have to rerun
    //   `playpass create` on their existing game
    if (!opts.local) {
        const token = await requireToken();
        const playpassClient = new PlaypassClient(token);

        if (await playpassClient.checkGame(subdomain)) {
            const games = await playpassClient.getGames();
            const game = games.find((game) => game.name === subdomain);
            
            let proceed = false;
            
            if (game) {
                const answer = await prompt({
                    type: "confirm",
                    message: `You already have an existing project named ${subdomain}.  Are you sure you wish to assign it to this project?`,
                    initial: true,
                });

                if (answer) {
                    gameId = game.id;
                    proceed = true;
                }
            }
            
            if (!proceed) {
                throw new Error(`Subdomain ${subdomain}.${playpassHost} already exists. Please use a different name.`);
            }
        } else {
            try {
                const game = await playpassClient.create(subdomain);
                gameId = game.id;
            } catch (e) {
                throw new Error(`Failed to create game ${subdomain}, please try again`);
            }
        }
    }

    if (useTemplate) {
        if (await exists(destDir)) {
            throw new Error(`Directory ${destDir} already exists. Please use a different name.`);
        }

        const template = opts.template || await prompt({
            type: "select",
            name: "template",
            message: "Choose a project template below",
            choices: templates,
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
        silent: true,
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
