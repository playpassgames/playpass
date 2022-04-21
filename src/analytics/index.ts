//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import type { Analytics } from "./analytics";
import { PlaypassAnalytics } from "./playpass-analytics";

export type { Analytics } from "./analytics";

export const playpassAnalytics = new PlaypassAnalytics();

let secondaryAnalytics: Analytics | undefined;

// Sends analytics to both backends during the transition period
class MirrorAnalytics implements Analytics {
    track (name: string, props?: Record<string,unknown>) {
        playpassAnalytics.track(name, props);
        if (secondaryAnalytics) {
            secondaryAnalytics.track(name, props);
        }
    }

    setUserProperties (props: Record<string,unknown>) {
        playpassAnalytics.setUserProperties(props);
        if (secondaryAnalytics) {
            secondaryAnalytics.setUserProperties(props);
        }
    }
}

/** @hidden Analytics for event tracking. */
export const analytics: Analytics = new MirrorAnalytics();

export function injectSecondaryAnalytics (analytics: Analytics) {
    secondaryAnalytics = analytics;
}
