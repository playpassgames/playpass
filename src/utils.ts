//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

const base62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function randomId (prefix: string) {
    let str = prefix+"_";
    for (let ii = 0; ii < 22; ++ii) {
        str += base62.charAt(Math.random() * 62 >>> 0);
    }
    return str;
}

export default function getQueryParameters(url?: string): {
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
