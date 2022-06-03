//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import type { Analytics, EventProps, UserProps } from "./analytics";
import { PlaypassAnalytics } from "./playpass-analytics";

export type { Analytics, EventProps } from "./analytics";

export const playpassAnalytics = new PlaypassAnalytics();

export type AnalyticsEventTransformer = (name: string, props?: EventProps) => EventProps;

// Sends analytics to both backends during the transition period
class MirrorAnalytics implements Analytics {
    private targets: Analytics[] = [playpassAnalytics];

    private interceptors: AnalyticsEventTransformer[] = [];

    track(name: string, props?: EventProps) {
        const evt = this.interceptors.reduce(
            (out, transformer) => transformer(name, out),
            props
        );

        this.targets.forEach(
            (target) => {
                target.track(name, evt);
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

    addTransformer(transformer: AnalyticsEventTransformer) {
        this.interceptors.push(transformer);
    }
}

const mirror = new MirrorAnalytics();

/** @hidden Analytics for event tracking. */
export const analytics: Analytics = mirror;

export function injectSecondaryAnalytics(analytics: Analytics) {
    mirror.addTarget(analytics);
}

export function injectAnalyticsTransformer(transformer: AnalyticsEventTransformer) {
    mirror.addTransformer(transformer);
}