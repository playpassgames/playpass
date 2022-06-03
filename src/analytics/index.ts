//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import type { Analytics, EventProps, UserProps } from "./analytics";
import { PlaypassAnalytics } from "./playpass-analytics";

export type { Analytics, EventProps } from "./analytics";

export const playpassAnalytics = new PlaypassAnalytics();

// Sends analytics to both backends during the transition period
class MirrorAnalytics implements Analytics {
    private targets: Analytics[] = [playpassAnalytics];

    track(name: string, props?: EventProps) {
        this.targets.forEach(
            (target) => {
                target.track(name, props);
            }
        );
    }

    setUserProperties (props: UserProps) {
        this.targets.forEach(
            (target) => {
                target.setUserProperties(props);
            }
        );
    }

    addTarget(target: Analytics) {
        this.targets.push(target);
    }
}

const mirror = new MirrorAnalytics();

/** @hidden Analytics for event tracking. */
export const analytics: Analytics = mirror;

export function injectSecondaryAnalytics(analytics: Analytics) {
    mirror.addTarget(analytics);
}
