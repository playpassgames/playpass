//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { analytics } from "../analytics";
import { encode } from "../links";
import { getGCInstantEntryData, getPlayerId } from "../init";
import { shortHash } from "../utils";

import { ShareType } from "./share-type";

import "../ui/share-popup";

export type { ShareType };

/** Options to pass to {@link share}. */
export type ShareOptions = {
    /** Files to be included in share.  For file compatibility, see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share#shareable_file_types */
    files?: File[],

    /** Text to be shared. */
    text?: string,

    /** The type of share, defaults to "any". */
    type?: ShareType,
};

/** Options to pass to {@link createLink}. */
export type CreateLinkOptions = {
    /** The entry channel to use for tracking. */
    channel?: string,

    /** Payload to include with shared link. */
    data?: unknown,
};

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

    // If we didn't receive a text or files, just share a simple link
    const text = (opts?.text || files.length) ? opts?.text : createLink();

    const type = opts?.type || ShareType.Any;

    const trackParams = { fileCount: files.length, textLength: text?.length ?? 0, type };
    analytics.track("SharePrompted", trackParams);

    const shareData = { files, text };

    let shareSent = false;

    if (type == ShareType.Any) {
        // Check for ontouchstart to blacklist desktop browsers in order to prevent using Chrome's
        // goofy share UX on Windows
        if (navigator.canShare?.(shareData) && navigator.share && "ontouchstart" in document.documentElement) {
            try {
                await navigator.share(shareData);
                shareSent = true;
            } catch (error: unknown) {
                if (!(error instanceof Error)) {
                    throw error;
                }
                if (error.name == "AbortError") {
                    analytics.track("ShareRejected", trackParams);
                } else {
                    analytics.track("ShareError", {...trackParams, error: error.name});
                }
            }

        } else if (text) {
            shareSent = await new Promise(resolve => {
                const popup = document.createElement("playpass-share");
                popup.shareText = text;
                popup.onShare = type => {
                    resolve(type ? doShare(type, text) : false);
                };
                document.body.appendChild(popup);
            });
        }

    } else if (text && await doShare(type, text)) {
        shareSent = true;
    }

    if (shareSent) {
        analytics.track("ShareSent", trackParams);
    }
    return shareSent;
}

async function doShare (type: ShareType, text: string): Promise<boolean> {
    const urlPattern = /\bhttps?:\/\/[^\s]+/;
    const urlMatch = text.match(urlPattern);
    const textNoUrls = text.replace(urlPattern, "").trim();

    switch (type) {
    case ShareType.Facebook:
        openNewTab("https://www.facebook.com/sharer/sharer.php", {
            quote: textNoUrls,
            u: urlMatch ? urlMatch[0] : createLink(),
        });
        return true;

    case ShareType.Twitter:
        openNewTab("https://twitter.com/intent/tweet", { text });
        return true;

    case ShareType.WhatsApp:
        openNewTab("https://api.whatsapp.com/send", { text });
        return true;

    case ShareType.Telegram:
        openNewTab("https://telegram.me/share/msg", {
            text: textNoUrls,
            url: urlMatch ? urlMatch[0] : createLink(),
        });
        return true;

    case ShareType.Clipboard:
        void copyToClipboard(text);
        return true;

    default:
        throw new Error(`Unsupported share type: ${type}`);
    }
}

function openNewTab (url: string, params: Record<string,string>) {
    const u = new URL(url);
    for (const key in params) {
        u.searchParams.set(key, params[key]);
    }
    window.open(u.toString(), "_blank", "noopener");
    // TODO(2022-05-16): Detect popup blocked
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
            ...getGCInstantEntryData(),
            $channel: opts?.channel ?? "SHARE",
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
