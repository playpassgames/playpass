//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { ShareType } from "../share/share-type";

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

/**
 * Detect the best share type, based on the browser's user agent and referrer URL. For example, this
 * will return "facebook" if the game was launched from clicking a Facebook post, or is being played
 * inside the Facebook mobile app.
 *
 * You can use this to create a share button that the player is more likely to engage with.
 */
export function getBestShareType (): ShareType {
    const referrer = document.referrer && new URL(document.referrer).hostname;
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
