//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { injectSecondaryAnalytics } from "./analytics";

declare global {
    interface Window {
        dataLayer: unknown[];
    }
}

export function initGTM(options: {
    tagId: string
}) {
    injectSecondaryAnalytics({
        track(name, props) {
            window.dataLayer.push({
                event: name,
                value: props,
            });
        },
        setUserProperties() {
            // do nothing    
        }
    });
}
