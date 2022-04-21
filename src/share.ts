//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { analytics } from "./analytics";
import { encode } from "./links";
import { getPlayerId } from "./init";
import { shortHash } from "./utils";

/** Options to pass to {@link share}. */
export type ShareOptions = {
    /** Files to be included in share.  For file compatibility, see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share#shareable_file_types */
    files?: File[],

    /** Text to be shared */
    text?: string,
};

export type CreateLinkOptions = {
    /** The entry channel to use for tracking. */
    channel?: string,

    /** Payload to include with shared link. */
    data?: unknown,
}

/**
 * Open the device share dialog.
 *
 * WARNING! This function must be called in a user gesture handler such as pointerup.
 *
 * Sending a share with a game link:
 * ```javascript
 * playpass.share({
 *   text: "Here's a coin gift for you: " + playpass.createLink({data: { coins: 123 } }),
 * });
 * ```
 *
 * Receive data from the game link:
 * ```javascript
 * const data = playpass.getLinkData();
 * if (data) {
 *     console.log("Opened a link with coins!", data.coins);
 * }
 * ```
 *
 * @returns Whether the share was successfully sent.
 */
export async function share(opts?: ShareOptions): Promise<boolean> {
    const files = opts?.files || [];
    let text = opts?.text;
    if (!text && !files.length) {
        // If we didn't receive a text or files, just share a simple link
        text = createLink();
    }

    const trackParams = { fileCount: files.length, textLength: text?.length ?? 0 };
    analytics.track("SharePrompted", trackParams);

    const shareData = { files, text };

    if (navigator.canShare?.(shareData) && navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (error: unknown) {
            if (!(error instanceof Error)) {
                throw error;
            }
            if (error.name == "AbortError") {
                analytics.track("ShareRejected", trackParams);
            } else {
                analytics.track("ShareError", {...trackParams, error: error.name});
            }
            return false;
        }
    } else {
        // TODO(2022-03-01): Polyfill web share, for now just write to the clipboard

        try {
            await copyToClipboard(text ?? "");
        } catch (error: unknown) {
            if (!(error instanceof Error)) {
                throw error;
            }
            // Should never happen(?)
            analytics.track("ShareError", {...trackParams, error: error.name});
            return false;
        }
    }

    analytics.track("ShareSent", trackParams);
    return true;
}

/**
 * Generate a short link for sharing the game.  Use this when a shareable link is desired for use outside of the `share` method.
 * @param opts - CreateLinkOptions
 * @returns A string representing the shortened url containing the payload data
 */
export function createLink(opts?: CreateLinkOptions) {
    // During local development or games hosted on *.playpass.games, use a fixed short domain
    const shortDomain = (location.port || location.hostname.endsWith(".playpass.games"))
        ? "playpass.link"
        : location.hostname;

    const longUrl = encode({
        channel: opts?.channel ?? "SHARE",
        data: opts?.data,
        referrer: getPlayerId(),

        // TODO(2022-03-18): Remove, gcinstant only
        gcinstant: {
            $channel: opts?.channel ?? "SHARE",
            playerID: getPlayerId(),
        },
    });

    // Perform a background API request to actually create the shortlink
    void callShortener(longUrl);

    // We locally compute what the shortlink will be to avoid waiting
    return `https://${shortDomain}/${shortHash(longUrl)}`;
}

async function callShortener (longUrl: string): Promise<void> {
    const response = await fetch("https://api.playpass.link", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic d29yZHMuZ2c6RHV4ZXRTMVhPTXBEd3JjZA==",
        },
        body: JSON.stringify({
            url: longUrl,
        }),
    });

    await response.json();
}

/** @hidden */
export async function copyToClipboard (text: string): Promise<void> {
    try {
        analytics.track("ClipboardCopy");

        // Attempt to use the async clipboard API, which is not universally supported
        await navigator.clipboard.writeText(text);
        analytics.track("ClipboardCopySuccess");
    } catch {
        // Fall back to using execCommand on a dummy textarea element
        const textArea = document.createElement("textarea");

        textArea.value = text;

        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        return new Promise((resolve, reject) => {
            if (document.execCommand("copy")) {
                analytics.track("ClipboardCopySuccess");
                resolve();
            } else {
                analytics.track("ClipboardCopyFailure");
                reject(new Error("execCommand copy failed"));
            }
            textArea.remove();
        });
    }
}
