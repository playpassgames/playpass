//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

/**
 * Whether the game has its own custom domain name. In other words, not running on localhost or
 * foo.playpass.games or foo.playpass-staging.com.
 */
export const hasCustomDomain = !location.port && !location.hostname.includes(".playpass");

const base62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function randomId (prefix: string) {
    let str = prefix+"_";
    for (let ii = 0; ii < 22; ++ii) {
        str += base62.charAt(Math.random() * 62 >>> 0);
    }
    return str;
}

export function getQueryParameters(url?: string): {
  [key: string]: string;
} {
    const search = url ? new URL(url).search : window.location.search;
    const params: Record<string, string> = {};
    new URLSearchParams(search).forEach((value, key) => (params[key] = value));
    return params;
}

export function shortHash (input: string) {
    // First calculate an unsigned 32 bit hash of the input
    let n = 0;
    for (let ii = 0, ll = input.length; ii < ll; ++ii) {
        n = Math.imul(31, n) + input.charCodeAt(ii) >>> 0;
    }

    // Bail early on a zero hash to avoid ever returning an empty string
    if (n == 0) {
        return "0";
    }

    // Output the hash in base 62 (with digits reversed)
    let output = "";
    while (n > 0) {
        output += base62.charAt(n % 62);
        n = (n / 62) >>> 0;
    }
    return output;
}

export function camelCasePrefix (prefix: string, str: string): string {
    return prefix + str.charAt(0).toUpperCase() + str.substring(1);
}

/** Post a JSON object to a URL in the background. */
export function sendBackground (url: string, body: unknown): void {
    void fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        keepalive: true,
    });
}
/** Post a JSON object to a URL. */
export function sendPost (url: string, body: unknown): Promise<Response> {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        keepalive: true,
    }).then((res) => {
        if (res.status != 200) {
            throw new Error(`HTTP ${res.status}`);
        }
        return res;
    });
}

