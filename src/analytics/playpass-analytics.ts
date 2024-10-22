//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { Analytics } from "./analytics";
import { randomId, sendBackground } from "../utils";
import { getPlayerId } from "../init";
import { getReferrer } from "../device";

// Milliseconds to wait before flushing a batch of events
const SEND_DELAY = 250;

type RequestData = {
    project_id: string;
    events: EventData[];
};

type EventData = {
    user_id: string;
    session_id: string;
    event_time: string; // ISO timestamp
    event_type: string;
    page: string;
    referrer: string;
    locale: string;
    event_properties: Record<string, unknown>;
    user_properties: Record<string, unknown>;
};

// Sends a request to the backend API
function record(body: RequestData) {
    // sendBackground("https://t.playpass.games/record", body);
}

export class PlaypassAnalytics implements Analytics {
    private initialized = false;
    private gameId: string | undefined = undefined;

    private eventQueue: Array<EventData> = [];
    private userProps: Record<string, unknown> = {};
    private sessionId: string;

    constructor() {
        // TODO(2022-03-17): Should this be stored in window.sessionStorage to survive page reloads?
        this.sessionId = randomId("session");

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState == "hidden") {
                this.track("PageHide");
                this.flush(); // Send immediately in case the tab is being closed
            }
        });

        const onPointerDown = () => {
            this.track("FirstTap");
            window.removeEventListener("pointerdown", onPointerDown);
        };
        window.addEventListener("pointerdown", onPointerDown);
    }

    track(name: string, props?: Record<string, unknown>) {
        if (this.initialized && this.eventQueue.length == 0) {
            // Schedule a batch flush
            setTimeout(() => {
                this.flush();
            }, SEND_DELAY);
        }
        this.eventQueue.push({
            user_id: getPlayerId(),
            session_id: this.sessionId,
            event_time: new Date().toISOString(),
            event_type: name,
            page: document.location.href,
            referrer: getReferrer(),
            locale: navigator?.language,
            event_properties: props || {},
            user_properties: this.userProps,
        });
    }

    setUserProperties(props: Record<string, unknown>) {
        // Copy-on-write to avoid changing any queued events
        this.userProps = {
            ...this.userProps,
            ...props,
        };
    }

    init(gameId: string | undefined) {
        this.initialized = true;
        this.gameId = gameId;
        this.flush();
    }

    flush() {
        if (this.eventQueue.length) {
            // console.log("Will send events", this.eventQueue.slice());
            if (this.gameId) {
                record({
                    project_id: this.gameId,
                    events: this.eventQueue,
                });
            }
            this.eventQueue.length = 0;
        }
    }
}
