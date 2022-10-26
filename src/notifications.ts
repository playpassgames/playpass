//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { requireReplicantClient } from "./login";
import { createLink } from "./share";

// export const smsConsentText = "By clicking \"Sign Up\", you agree to Playco’s <a href=\"https://www.play.co/tos\">Terms of Service</a> and acknowledge the <a href=\"https://www.play.co/privacy\" target=\"_blank\">Privacy Policy</a>. You also consent to receive calls or SMS messages, including by automated dialer, from Playco and its affiliates to the number you provide for informational and/or marketing purposes. Consent not required as a condition of purchase. Message and data rates may apply. <a href=\"/sms-terms.html\" target=\"_blank\">SMS Terms</a> apply.";

// export function isSubscribed () {
//     return requireReplicantClient("playpass.notifications.isSubscribed").chatbotSubscriptions.isSubscribed();
// }

// export function subscribeSms () {
//     return requireReplicantClient("playpass.notifications.subscribeSms").chatbotSubscriptions.subscribeSms(smsConsentText);
// }

// export function unsubscribeSms () {
//     return requireReplicantClient("playpass.notifications.unsubscribeSms").chatbotSubscriptions.unsubscribeSms();
// }

// export function unsubscribe (): void {
//   requireReplicantClient('playpass.notifications.unsubscribe').chatbotSubscriptions.unsubscribeWebPush();
// }

/** The Web Push notification subscription state. */
export enum PermissionState {
    /** The player has granted permission. */
    Granted = "granted",

    /** The player has explicitly denied permissions, preventing any future permission requests. */
    Denied = "denied",

    /** The player hasn't granted permission yet, but we can prompt them to enable it. */
    Prompt = "prompt",

    /** The player's browser doesn't support Web Push notifications, or the PWA is misconfigured. */
    Unsupported = "unsupported",
}

/** Options to pass to {@link schedule}. */
export type ScheduleOptions = {
    /** How many milliseconds from now to send this notification. */
    delay?: number;

    /** Text displayed in the title of the notification bubble. */
    title?: string;

    /** 
     * The SMS message text. You should prefix this with the name of your game, so players know who
     * the random phone number texting them is. Eg: "Beadle: New puzzle available!"
     */
    smsText?: string;

    /** The link to open when the player engages with the notification. */
    link?: string;

    /** Text displayed in the body (subtitle) of the notification bubble. */
    body?: string;

    /** Icon image displayed in the notification bubble. */
    icon?: string;

    /** Android-only badge image displayed in the notification bubble. */
    badge?: string;

    /** Banner image displayed in the notification bubble. */
    image?: string;
};

export async function getPermissionState (): Promise<PermissionState> {
    if (navigator.serviceWorker) {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration?.pushManager) {
                const state = await registration.pushManager.permissionState({ userVisibleOnly: true });
                if (state == "granted") {
                    // Also require an active subscription. If the user opted out then back in to
                    // notifications, they may have lost their push subscription
                    const pushSubscription = await registration.pushManager.getSubscription();
                    return pushSubscription ? PermissionState.Granted : PermissionState.Prompt;
                }
                return state as PermissionState;
            }
        } catch (error) {
            console.error(error);
        }
    }
    return PermissionState.Unsupported;
}

export async function requestPermission (): Promise<boolean> {
    if (navigator.serviceWorker) {
        let pushSubscription: PushSubscription;
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            pushSubscription = await registration!.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: "BK3mBpzGb_g6LEJfAxO_QAroFuMrMSbffu_SwpDTPU0L2GTWsoaRkmZZTJw6PPmmo0uJBue2Y0hGDZtineDELkA",
            });
        } catch (error) {
            console.error(error);
            return false;
        }

        void requireReplicantClient("playpass.notifications.subscribe").chatbotSubscriptions.subscribeWebPush(pushSubscription);
        return true;
    }
    return false;
}

/**
 * Schedules a push notification.
 *
 * Only one notification with a given tag can be scheduled at a time. If another notification was
 * previously scheduled with the given tag, the entire notification is replaced with the new one.
 *
 * @param opts Options for configuring display and delivery of the notification.
 */
export function schedule (tag: string, opts?: ScheduleOptions): void {
    const title = opts?.title || "";
    const smsText = opts?.smsText || title;
    const link = opts?.link || createLink({ channel: "NOTIFICATION" });

    void requireReplicantClient("playpass.notifications.schedule").chatbotSubscriptions.createNotification({
        millis: opts?.delay || 0,
        smsText: smsText,
        notificationId: tag,
        url: link,
        title: title,
        body: opts?.body,
        icon: opts?.icon,
        badge: opts?.badge,
        image: opts?.image,
    });
}
