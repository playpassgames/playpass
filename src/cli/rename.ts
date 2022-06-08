//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import {loadConfig} from "./config";
import path from "path";
import {requireToken} from "./auth";
import PlaypassClient from "./playpass-client";
import prompts from "prompts";
import {slugify} from "./utils";
import kleur from "kleur";

const confirmationMessage = `All game assets you deployed will be deleted.
  You will need to redeploy your game after renaming.
  Are you sure?`;

export async function rename(name: string | undefined, opts: {yes: boolean}): Promise<void> {
    const config = await loadConfig(path.join(process.cwd(), "playpass.toml"));

    const token = await requireToken();
    const playpassClient = new PlaypassClient(token);

    if (!opts.yes) {
        const { value } = await prompts({
            type: "confirm",
            name: "value",
            message: confirmationMessage,
            initial: true,
        });
        if (!value) {
            return;
        }
    }

    if (!name) {
        const { value } = await prompts({
            type: "text",
            name: "value",
            message: "What will we your project's new name?",
            initial: "my-game",
        });
        name = slugify(value);
    }

    console.log("Renaming game...");
    try {
        const updated = await playpassClient.updateGame(config.game_id, name);
        console.log(`${kleur.green("✔")} Renamed game to ${updated.name}`);
    } catch (e: unknown) {
        throw new Error(`Failed to rename game: ${e}`);
    }
}