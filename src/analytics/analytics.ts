//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

export type UserProps = Record<string,unknown>;

export type EventProps = Record<string,unknown>;

/** @hidden Analytics service, for tracking events. */
export interface Analytics {
    /** Track an event. */
    track (name: string, props?: EventProps): void;

    /** Add custom properties for the user. */
    setUserProperties (props: UserProps): void;
}
