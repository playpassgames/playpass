//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import * as utils from "./utils";
import { decode, stripPayloadsFromUrl } from "./links";
import { initFeatureFlags } from "./featureFlags";
import { internalStorage } from "./storage";
import { analytics, playpassAnalytics } from "./analytics";
import { initLogin } from "./login";

let playerId = "";
let initialized = false;
let stripeAccount: string | undefined;

/** Options to pass to {@link init}. */
export type InitOptions = {
    gameId: string;
    stripeAccount?: string;

    /** Additional tracking properties that will be sent along with the Entry event. */
    trackProps?: Record<string,unknown>;
}

/** Initialize the Playpass SDK. */
export async function init (opts?: InitOptions): Promise<void> {
    // Generate a player ID across sessions
    playerId = await internalStorage.get("playerId") as string;
    if (!playerId) {
        playerId = utils.randomId("player");
        void internalStorage.set("playerId", playerId);
    }

    stripeAccount = opts?.stripeAccount;

    const gameId = opts?.gameId || "unknown";

    // Initialize our subsystems
    await Promise.all([
        initFeatureFlags(),
        initLogin(gameId),
    ]);

    playpassAnalytics.init(gameId);

    const payload = decode();
    const gcInstantEntryData = getGCInstantEntryData();

    // Strip any payloads from the URL if needed
    const strippedUrl = stripPayloadsFromUrl(location.href);
    if (strippedUrl != location.href) {
        history.replaceState(null, "", strippedUrl);
    }

    playpassAnalytics.track("Entry", {
        // We need to track the ?payload URL param for marketing's ad params. Once we settle on a
        // post-gcinstant URL scheme for ad marketing we can remove this.
        ...gcInstantEntryData,

        channel: payload.channel,
        $referrer_id: payload.referrer,

        ...opts?.trackProps,
    });

    window.addEventListener("appinstalled", () => {
        analytics.track("HomescreenInstall");
    });

    initialized = true;
}

export function requireInit (name: string) {
    if (!initialized) {
        throw new Error(`Await for playpass.init() before calling ${name}()`);
    }
}

export function getStripeAccount (): string | undefined {
    return stripeAccount;
}

/** Get the player's unique ID. */
export function getPlayerId (): string {
    // TODO(2022-03-29): Throw if not yet initialized
    return playerId;
}

function getGCInstantEntryData (): Record<string,unknown> {
    const gcInstantPayload = new URLSearchParams(location.search).get("payload");
    if (gcInstantPayload) {
        try {
            return JSON.parse(gcInstantPayload);
        } catch (error) {
            // Do nothing, this error will already be tracked if using gcinstant
        }
    }
    return {};
}
