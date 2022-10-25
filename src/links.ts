//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { analytics } from "./analytics";

// See playpass-opengrapher/lambda/src/app.ts
type OpengrapherMetadata = {
    // Open Graph <meta> tag names and values
    tags?: Record<string,unknown>;

    // The Amplitude key we should post events to
    amplitude?: string;

    // The base URL we should redirect to, *without* the encoded payload
    url: string;

    payload: Payload;
};

type Payload = {
    /** The entry channel to use for tracking. */
    channel?: string,

    /** When this link was created. */
    createdAt?: number;

    /** Custom data exposed to the game. */
    data?: unknown,

    /** Feature flags that should be force set or unset for this player. */
    featureFlags?: Record<string,unknown>,

    /** The player ID that created this share link. */
    referrer?: string,

    /** Tracking parameters to send along with the entry event. */
    // TODO(2022-03-18): Rename to "entry" when we remove gcinstant
    gcinstant?: Record<string,unknown>,

    /** See CreateLinkOptions.trackProps. */
    trackProps?: Record<string,unknown>,

    /** The original HTTP Referer header if we were redirected through the opengrapher. */
    httpReferrer?: string,
};

let cachedPayload: Payload;

export function decode (): Payload {
    if (cachedPayload) {
        return cachedPayload;
    }

    try {
        cachedPayload = decodeRaw(location.href);
    } catch (error: unknown) {
        console.error("Failed to decode payload", error);
        cachedPayload = {};
        analytics.track("PayloadDecodeError", {url: location.href});
    }
    return cachedPayload;
}

export function decodeRaw (href: string): Payload {
    const url = new URL(href);
    const urlLink = url.searchParams.get("link");
    if (urlLink) {
        return JSON.parse(urlLink) || {};
    }

    const hash = new URL(url.hash.substring(1), url.origin);
    const hashLink = hash.searchParams.get("link");
    if (hashLink) {
        return JSON.parse(hashLink) || {};
    }

    // LEGACY (2022-03-xx). Handle legacy link format where we stuck the JSON directly in the hash
    try {
        return JSON.parse(decodeURIComponent(url.hash.substring(1)));
    } catch (error) {
        // Swallow errors in this case
    }

    return {};
}

export function constructMetaPayload(
    explicitURL: string | undefined,
    payload: Payload,
    opts: { tags?: Map<string,unknown>, amplitudeKey?: string } = {}
) {
    // The URL should already have been stripped, but strip it again here just to be safe
    const url = stripPayloadsFromUrl(explicitURL ? new URL(explicitURL, location.origin).href : location.href);

    const meta: OpengrapherMetadata = {
        // Include Open Graph <meta> tags if available
        tags: (opts.tags && opts.tags.size) ? Object.fromEntries(opts.tags) : undefined,

        amplitude: opts.amplitudeKey,
        url,
        payload,
    };
    return meta;
}

export function encode (explicitURL: string | undefined,
    payload: Payload,
    opts: { tags?: Map<string,unknown>, amplitudeKey?: string } = {}
): string {
    // Setting up the opengrapher share URL fallback is currently a manual CloudFront configuration
    // process. So for now we keep a whitelist for those CF distributions that have been configured,
    // and default to using playpass.link otherwise. Once we automate this for new domains we can
    // remove this.
    const enabledHosts: Record<string,boolean> = {
        "beadle.gg": true,
        "tweedle.app": true,
        "qomedyquiz.com": true,
    };
    const opengrapherOrigin = enabledHosts[location.hostname] ? location.origin : "https://playpass.link";

    const meta = constructMetaPayload(explicitURL, payload, opts);

    const opengrapherUrl = new URL(opengrapherOrigin + "/share");
    opengrapherUrl.searchParams.set("meta", JSON.stringify(meta));
    return opengrapherUrl.href;
}

/** Gets the custom link data. */
export function getLinkData (): unknown {
    return decode().data;
}

/** Remove payload params from the given URL. */
export function stripPayloadsFromUrl (href: string): string {
    const url = new URL(href);

    // Strip the "link" param from the hash
    const hash = new URL(url.hash.substring(1), url.origin);
    if (hash.searchParams.has("link")) {
        hash.searchParams.delete("link");
        url.hash = hash.pathname + hash.search;

        // If this would result in a bare #/ hash, clean out the entire thing
        if (url.hash == "#/") {
            url.hash = "";
        }
    }
    url.searchParams.delete("link");

    // Also remove our old gcinstant legacy payload param
    url.searchParams.delete("payload");

    // Finally, remove any params added by ad networks
    // url.searchParams.delete('fbclid');
    // url.searchParams.delete('twclid');

    return url.toString();
}
