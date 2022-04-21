//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { requireToken } from "./auth";
import PlaypassClient from "./playpass-client";

export async function getDomains(): Promise<void> {
    const token = await requireToken();
    const playpassClient = new PlaypassClient(token);

    const customDomains = await playpassClient.getCustomDomains();

    console.log("Custom Domains");
    console.table(customDomains); //TODO: beautify this
}