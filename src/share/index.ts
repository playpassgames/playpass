//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { analytics } from "../analytics";
import { encode } from "../links";
import { getPlayerId } from "../init";
import { shortHash, sendBackground } from "../utils";
import { getBestShareType, isWebview } from "../device";

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

    /** Additional tracking properties that will be sent along with the Share events. */
    trackProps?: Record<string,unknown>,

    /** Optional, share type dependent, ID of a social media post at which to target this share. Twitter is only supported. */
    inReplyTo?: string,
};

/** Options to pass to {@link createLink}. */
export type CreateLinkOptions = {
    /** The entry channel to use for tracking, defaults to "SHARE". */
    channel?: string,

    /** Payload to include with shared link. */
    data?: unknown,

    /** Create a link to this explicit URL. It must have the same origin as the current document. If not specified, the current URL will be used. */
    url?: string,

    /** Open Graph title to display in embedded shares. */
    title?: string,

    /** Open Graph description to display in embedded shares. */
    description?: string,

    /** Open Graph image to display in embedded shares. */
    image?: string,

    /**
     * Additional tracking properties that will be sent along with the EntryFinal/EntryConversion
     * event.
     *
     * The event properties will also be prefixed and stored as firstEntry and lastEntry user
     * properties for the converted user.
     *
     * Eg: The link created by `playpass.createLink({ trackProps: { feature: "test" }})` will send a
     * `feature` event property with EntryFinal, and set the `lastEntryFeature` and
     * `firstEntryFeature` user properties.
     */
    trackProps?: Record<string,unknown>,
    useNewLinkFormat?: boolean,
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

    const trackParams = {
        fileCount: files.length,
        textLength: text?.length ?? 0,
        type,
        ...opts?.trackProps,
    };
    analytics.track("SharePrompted", trackParams);

    const shareData = { files, text };

    let shareSent = false;

    if (type == ShareType.Any || type == ShareType.Instagram || type == ShareType.TikTok) {
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

    } else if (text && await doShare(type, text, {inReplyTo: opts?.inReplyTo})) {
        shareSent = true;
    }

    if (shareSent) {
        analytics.track("ShareSent", trackParams);
    }
    return shareSent;
}

async function doShare (type: ShareType, text: string, options?: {inReplyTo?: string}): Promise<boolean> {
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
        if (options?.inReplyTo) {
            openNewTab("https://twitter.com/intent/tweet", { text, in_reply_to: options.inReplyTo });
        } else {
            openNewTab("https://twitter.com/intent/tweet", { text });
        }
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
    case ShareType.Reddit:
        openNewTab("https://www.reddit.com/submit", {
            title: textNoUrls,
            url: urlMatch ? urlMatch[0] : createLink(),
        });
        return true;
    case ShareType.Sms:
        // https://stackoverflow.com/questions/43946861/href-link-to-send-text-message
        openNewTab("sms:?&body=" + encodeURIComponent(text));
        return true;
    case ShareType.Clipboard:
        void copyToClipboard(text);
        return true;

    default:
        throw new Error(`Unsupported share type: ${type}`);
    }
}

function openNewTab (url: string, params: Record<string,string> = {}) {
    const u = new URL(url);
    for (const key in params) {
        u.searchParams.set(key, params[key]);
    }
    window.open(u.toString(), "_blank", "noopener");
    // TODO(2022-05-16): Detect popup blocked
}

let gcinstantSharePayload: Record<string,string> = {};
export function setGCSharePayload (sharePayload: Record<string,string>) {
    gcinstantSharePayload = sharePayload;
}

let amplitudeKey: string | undefined;
export function setAmplitudeKey (key: string) {
    amplitudeKey = key
}

/**
 * Generate a short link for sharing the game.  Use this when a shareable link is desired for use outside of the `share` method.
 * @param opts - CreateLinkOptions
 * @returns A string representing the shortened url containing the payload data
 */
export function createLink(opts?: CreateLinkOptions) {
    // During local development or games hosted on *.playpass.games, use a fixed short domain
    const shortDomain = (location.port || location.hostname.includes(".playpass"))
        ? "playpass.link"
        : location.hostname;

    const meta = new Map();
    if (opts?.title) {
        meta.set("og:title", opts.title);
    }
    if (opts?.description) {
        meta.set("og:description", opts.description);
    }
    if (opts?.image) {
        meta.set("og:image", opts.image);
        meta.set("twitter:card", "summary_large_image");
    }

    const bestShareType = getBestShareType();
    const app = bestShareType == "any" ? null : bestShareType;
    const webview = isWebview();
    const trackProps = {
        shareOriginApp: app,
        shareOriginIsWebview: webview,
        // shareOriginDeviceType?
        ...opts?.trackProps,
    };

    const longUrl = encode(opts?.url, {
        channel: opts?.channel ?? "SHARE",
        data: opts?.data,
        referrer: getPlayerId(),

        // TODO(2022-03-18): Remove, gcinstant only
        gcinstant: {
            ...gcinstantSharePayload,
            $channel: opts?.channel ?? "SHARE",
        },

        trackProps,
    }, { meta, amplitudeKey, useNewLinkFormat: opts?.useNewLinkFormat });

    // Perform a background API request to actually create the shortlink
    sendBackground("https://api.playpass.link", { url: longUrl });

    // We locally compute what the shortlink will be to avoid waiting
    return `https://${shortDomain}/${shortHash(longUrl)}`;
}

function toBlob (canvas: HTMLCanvasElement, type?: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) {
                reject(new Error(`Could not encode canvas to ${type}`));
            } else {
                resolve(blob);
            }
        }, type);
    });
}

/**
 * Uploads an image to a temporary URL. The image URL will only be valid for up to 90 days.
 *
 * This is designed to be used in combination with `createLink()` for dynamic share images.
 *
 * ```js
 * const imageUrl = await playpass.uploadTemporaryImage(canvas);
 *
 * const link = playpass.createLink({
 *     image: imageUrl,
 * });
 * ```
 */
export async function uploadTemporaryImage (canvas: HTMLCanvasElement, type?: "image/png" | "image/jpeg"): Promise<string> {
    const [ req, blob ] = await Promise.all([
        fetch("https://25spy6tc6yax3echnmksbm5yve0pfisl.lambda-url.us-east-1.on.aws"),
        toBlob(canvas, type),
    ]);
    const json = await req.json();

    await fetch(json.putUrl, {
        method: "PUT",
        body: blob,
    });

    return json.getUrl;
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
