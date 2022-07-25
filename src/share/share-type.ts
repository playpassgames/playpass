//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

/**
* A preferred share type to pass to {@link share}.
*
* Example:
*
* ```js
* playpass.share({
*     text: "Hello world",
*     type: "twitter",
* });
* ```
*/
export enum ShareType {
    /** Allow the player to choose where to share. */
    Any = "any",

    /** Share as a post on Facebook. */
    Facebook = "facebook",

    /** Share as a tweet on Twitter. */
    Twitter = "twitter",

    /** Share as a message on WhatsApp. */
    WhatsApp = "whatsapp",

    /** Share as a message on Telegram. */
    Telegram = "telegram",

    /** Share by copying text to the system clipboard. */
    Clipboard = "clipboard",

    /** Share as a post on Reddit. */
    Reddit = "reddit",

    /** Share on Instagram (not yet implemented). */
    Instagram = "instagram",

    /** Share on TikTok (not yet implemented). */
    TikTok = "tiktok",

    /** Share as a SMS text message. */
    Sms = "sms",
}
