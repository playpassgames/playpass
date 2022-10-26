//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;

declare global {
    interface Navigator {
        // Currently Chrome-only: https://web.dev/badging-api/
        setAppBadge (count?: number): Promise<void>;
        clearAppBadge (): Promise<void>;
    }
}

/** Data attached to incoming web push events. */
type WebPushData = {
    title: string;
    url: string;
    body?: string;
    icon?: string;
    badge?: string;
    image?: string;
    timestamp?: number;
};

/** Data attached to displayed notifications. */
type NotificationData = {
    url: string;
};

function waitUntil<T extends ExtendableEvent> (handler: (event: T) => Promise<void>) {
    return (event: T) => {
        event.waitUntil(handler(event));
    };
}

function trackEvent (url: string, eventName: string): Promise<unknown> {
    // playpass-opengrapher will track these events in Amplitude, with the full set of tracking
    // properties
    return fetch(url, {
        headers: {
            "X-Playpass-Event": eventName,
        },
    });
}

/** Initialize the service worker, adding the necessary event listeners. */
export function init () {
    self.addEventListener("fetch", () => {
        // Implementing this listener is required for installability
    });

    self.addEventListener("push", waitUntil(async event => {
        const webPushData: WebPushData = event.data!.json();
        const notificationData: NotificationData = {
            url: webPushData.url,
        };

        // Show an unread indicator on the app icon when notifications come in
        if (navigator.setAppBadge) {
            void navigator.setAppBadge();
        }

        await self.registration.showNotification(webPushData.title, {
            body: webPushData.body,
            icon: webPushData.icon,
            badge: webPushData.badge,
            timestamp: webPushData.timestamp,
            image: webPushData.image,
            data: notificationData,
        });

        await trackEvent(webPushData.url, "NotificationShown");
    }));

    self.addEventListener("notificationclick", waitUntil(async event => {
        const notification = event.notification;
        notification.close();

        const notificationData: NotificationData = notification.data;
        const windowClient = await self.clients.openWindow(notificationData.url);
        if (windowClient) {
            await windowClient.focus();
        }

        await trackEvent(notificationData.url, "NotificationClicked");
    }));
}
