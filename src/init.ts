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
let stripeScript: HTMLScriptElement | undefined;
let phoneCodeCss: HTMLLinkElement | undefined;
let phoneCodeScript: HTMLScriptElement | undefined; 

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
    if (!stripeScript) {
        stripeScript = document.createElement("script");
        stripeScript.setAttribute("src", "https://js.stripe.com/v3/");
        stripeScript.setAttribute("crossorigin", "anonymous");
        document.head.appendChild(stripeScript);
    }

    // country code drop down elements for phone
    if (!phoneCodeCss) {
        phoneCodeCss = document.createElement("link");
        phoneCodeCss.rel = "stylesheet";
        phoneCodeCss.href = "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.css";
        document.head.appendChild(phoneCodeCss);
    }

    if (!phoneCodeScript) {
        phoneCodeScript = document.createElement("script");
        phoneCodeScript.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js");
        phoneCodeScript.setAttribute("crossorigin", "anonymous");
        document.head.appendChild(phoneCodeScript);

        const phoneInputStyle = document.createElement("style");
        phoneInputStyle.innerText = ".phoneInput { transition: box-shadow; outline: none; box-shadow: none; border: 1px solid #a2afb9; padding: 0.75rem 1rem; font-size: 1.25rem; border-radius: 0.25rem; } .phoneInput:focus { box-shadow: 0 0 0 3px rgba(16, 149, 193, 0.125); border-color: var(--primary); }";
        document.head.appendChild(phoneInputStyle);
    }

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
