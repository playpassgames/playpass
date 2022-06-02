//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import {loadConfig} from "./config";
import path from "path";
import {requireToken} from "./auth";
import PlaypassClient from "./playpass-client";
import kleur from "kleur";
import prompts from "prompts";

const deleteMessage = `All game assets you deployed will be deleted, as well as any custom domain configurations if you have any.
  You will also lose access to the game name (you can later recreate a game with the same name if still available).
  Are you sure?`;

export async function deleteGame(opts: {yes: boolean}): Promise<void> {
    const config = await loadConfig(path.join(process.cwd(), "playpass.toml"));

    const token = await requireToken();
    const playpassClient = new PlaypassClient(token);

    if (!opts.yes) {
        const confirm = await prompts({
            type: "confirm",
            name: "value",
            message: deleteMessage,
            initial: true,
        });
        if (!confirm.value) {
            return;
        }
    }

    console.log("Deleting game...");
    try {
        const deleted = await playpassClient.deleteGame(config.game_id);
        console.log(`${kleur.green("✔")} Deleted game ${deleted.name}`);
    } catch (e: unknown) {
        throw new Error(`Failed to delete game: ${e}`);
    }
}