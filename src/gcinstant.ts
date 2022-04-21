//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

/**
 * Temporary transition code for GCInstant/Amplitude.
 */

import userAgent from "@play-co/user-agent";
import { PlatformWeb, analytics as gcAnalytics } from "@play-co/gcinstant";
import type { AnalyticsProperties, GameConfig } from "@play-co/gcinstant";

import { Analytics, injectSecondaryAnalytics } from "./analytics";
import { decode } from "./links";
import { getPWADisplayMode } from "./pwa";
import { getPlayerId } from "./init";
import { internalStorage } from "./storage";

let gcPlatform: PlatformImpl;

class PlatformImpl extends PlatformWeb {
    /** Same as initializeAsync, but pass the player ID to initialize Amplitude. */
    async initializeAsync2 (playerId: string, config: GameConfig): Promise<void> {
        if (this._initialized) {
            return Promise.resolve();
        }

        this.trackTimeTo("initializeAsync");
        this.readConfiguration(config);
        this.getEntryPointData();

        this._initialized = true;
        this.resolveFriendsAvailable();

        this.osType = userAgent.os.isAndroid
            ? "ANDROID"
            : userAgent.os.isIOS
                ? "IOS"
                : "WEB";
        this.isMobile = this.osType !== "WEB";

        gcAnalytics.initialize(
            playerId,
            {
                ...this._gameConfig,
                appID: this.appID, // this is to work around years-old technical debt related to appID sometimes being an object in the config
            },
        );
        // events.trackPlatformInitSuccess();

        this.setPlayerID(playerId);
    }

    /** Grab entry point data from link payload. */
    public override _getEntryPointDataForce(): AnalyticsProperties.EntryData {
        return decode().gcinstant as AnalyticsProperties.EntryData || super._getEntryPointDataForce();
    }
}

class AmplitudeAnalytics implements Analytics {
    track (name: string, props?: Record<string,unknown>) {
        gcAnalytics.pushEvent(name, props);
    }

    setUserProperties (props: Record<string,unknown>) {
        gcAnalytics.setUserProperties(props);
    }
}

export async function initGCInstant (opts?: {amplitude: string}): Promise<void> {
    injectSecondaryAnalytics(new AmplitudeAnalytics());

    gcPlatform = new PlatformImpl();

    gcPlatform.storage.setStorageAdapter({
        load: () => internalStorage.get("gcinstant"),
        save: (data) => internalStorage.set("gcinstant", data),
    });

    const pwaDisplay = getPWADisplayMode();
    if (pwaDisplay === "pwa" || pwaDisplay === "standalone") {
        gcPlatform.entryPointName = "home_screen_shortcut";
    }

    await gcPlatform.initializeAsync2(getPlayerId(), {
        amplitudeKey: opts?.amplitude,

        isDevelopment: process.env.NODE_ENV === "development",

        appID: "playco-game",
        shortName: "playco-game",
        version: "0.0.0",
    });

    // Send an EntryFinal to Amplitude
    await gcPlatform.startGameAsync();
    void gcPlatform.sendEntryFinalAnalytics({}, {}, {});
}
