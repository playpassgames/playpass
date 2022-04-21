//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

/** @hidden Analytics service, for tracking events. */
export interface Analytics {
    /** Track an event. */
    track (name: string, props?: Record<string,unknown>): void;

    /** Add custom properties for the user. */
    setUserProperties (props: Record<string,unknown>): void;
}
