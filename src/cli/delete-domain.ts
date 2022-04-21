//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { requireToken } from "./auth";
import PlaypassClient from "./playpass-client";
import kleur from "kleur";

export async function deleteDomain(domainId: string): Promise<void> {
    const token = await requireToken();
    const playpassClient = new PlaypassClient(token);

    await playpassClient.deleteDomain(domainId);

    console.log(`${kleur.green("✔")} Successfully deleted custom domain ${domainId}`);
}