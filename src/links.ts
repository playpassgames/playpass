//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { analytics } from "./analytics";

type Payload = {
    /** The entry channel to use for tracking. */
    channel?: string,

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
};

let cachedPayload: Payload;

export function decode (): Payload {
    if (cachedPayload) {
        return cachedPayload;
    }

    try {
        return cachedPayload = decodeRaw(location.href);
    } catch (error: unknown) {
        console.error("Failed to decode payload", error);
        analytics.track("PayloadDecodeError", {url: location.href});
    }
    return cachedPayload = {};
}

export function decodeRaw (href: string): Payload {
    const url = new URL(href);
    // try the top level link payload
    if (url.searchParams.has("link")) {
        const link = url.searchParams.get("link");
        if (link) {
            return JSON.parse(link);
        }
    }

    // LEGACY 2 ( 2022-07-27) else try to parse the hash link payload
    const hash = new URL(url.hash.substring(1), url.origin);
    const link = hash.searchParams.get("link");
    if (link) {
        return JSON.parse(link) || {};
    }

    // LEGACY 1 (2022-03-xx). Handle legacy link format where we stuck the JSON directly in the hash
    try {
        return JSON.parse(decodeURIComponent(url.hash.substring(1)));
    } catch (error) {
        // Swallow errors in this case
    }

    return {};
}

export function encode (explicitURL: string | undefined,
                        payload: Payload,
                        opts: { meta?: Map<string,any>, amplitudeKey?: string, useNewLinkFormat?: boolean} = {}
                       ): string {
    const url = explicitURL ? new URL(explicitURL, location.origin) : new URL(location.href);

    url.searchParams.set("link", JSON.stringify(payload));

    // prefix the longurl with /s to trigger the share link handler, it will be stripped off.
    if (opts.meta) {
        opts.meta.forEach((value, key) => {
            url.searchParams.set(`meta-${key}`, value.toString());
        });
    }

    if(opts.useNewLinkFormat) {
        url.pathname = '/s' + url.pathname
    }

    // Include Open Graph metatags if available
    if (opts.meta && opts.meta.size) {
        url.searchParams.set("meta", JSON.stringify({tags: Object.fromEntries(opts.meta), a: opts.amplitudeKey}));
    }

    return url.toString();
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

    // Also remove our old gcinstant legacy payload param
    url.searchParams.delete("payload");

    return url.toString();
}
