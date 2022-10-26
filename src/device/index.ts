//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { ShareType } from "../share/share-type";
import { decode } from "../links";

type Detector = {
    shareType: ShareType;

    // User Agent pattern
    userAgent?: RegExp;

    // HTTP referrer pattern
    referrer?: RegExp;

    // Match if this URL query param exists
    queryParam?: string;
};

const detectors: Detector[] = [
    {
        // This needs to come before Facebook detection, since the user agent pattern overlaps
        shareType: ShareType.Messenger,

        userAgent: /\b(FBAN\/MessengerForiOS|FBAN\/MessengerLiteForiOS|FB_IAB\/Orca-Android|FB_IAB\/MESSENGER)\b/,
    },
    {
        shareType: ShareType.Facebook,

        // https://github.com/paypal/paypal-checkout-components/issues/484
        // https://gist.github.com/taylorhughes/dae564f63b3d702429a5f37bd22b97b8
        userAgent: /\b(FBAV|FBAN|FB_IAB)\//,

        // l.facebook.com and lm.facebook.com
        referrer: /\bfacebook\.com$/,

        // Set on traffic from Facebook ads
        queryParam: "fbclid",
    },
    {
        shareType: ShareType.Twitter,

        // No userAgent detection available on Twitter!

        // twitter.com seems unused, but included here for safety
        referrer: /\b(t\.co|twitter\.com)$/,

        // Set on traffic from Twitter ads
        queryParam: "twclid",
    },
    {
        shareType: ShareType.Reddit,
        referrer: /\b(redd\.it|reddit\.com)$/,
    },
    {
        shareType: ShareType.Instagram,

        userAgent: /\bInstagram\b/,

        // l.instagram.com
        referrer: /\binstagram\.com$/,
    },
    {
        shareType: ShareType.TikTok,

        userAgent: /\bBytedanceWebview\//,

        referrer: /\btiktok\.com$/,
    },
];

export function getReferrer (): string {
    // Use referrer injected by the opengraph redirect if available
    return decode().httpReferrer || document.referrer;
}

/**
 * Detect the best share type, based on the browser's user agent and referrer URL. For example, this
 * will return 'facebook' if the game was launched from clicking a Facebook post, or is being played
 * inside the Facebook mobile app.
 *
 * You can use this to create a share button that the player is more likely to engage with.
 */
export function getBestShareType (): ShareType {
    const referrer = getReferrer() && new URL(getReferrer()).hostname;
    const url = new URL(location.href);

    for (const detector of detectors) {
        if (detector.userAgent?.test(navigator.userAgent)
            || detector.referrer?.test(referrer)
            || (detector.queryParam && url.searchParams.has(detector.queryParam))) {
            return detector.shareType;
        }
    }

    return ShareType.Any;
}

export function isWebview (): boolean {
    for (const detector of detectors) {
        if (detector.userAgent?.test(navigator.userAgent)) {
            return true;
        }
    }
    return false;
}

interface BeforeInstallPromptEvent extends Event {
    prompt (): Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

/** The current installation state of the PWA. */
export enum InstallState {
    /** The PWA hasn't been installed yet, but we can prompt the user to install. */
    Installable = "installable",

    // Installed = "installed",

    /** The player's browser doesn't support PWA installation, or the PWA is misconfigured. */
    Unsupported = "unsupported",
}

let promptEvent: BeforeInstallPromptEvent;
window.addEventListener("beforeinstallprompt", event => {
    // Hide the default install banner to prevent it from hiding game UI
    event.preventDefault();

    promptEvent = event;
});

export function getInstallState (): InstallState {
    return promptEvent != null ? InstallState.Installable : InstallState.Unsupported;
}

/**
 * Requests the player to install the PWA to their home screen.
 * @returns Whether the installation was accepted by the player.
 */
export async function requestInstall (): Promise<boolean> {
    if (!promptEvent) {
        return false;
    }
    const { outcome } = await promptEvent.prompt();
    return (outcome == "accepted");
}
