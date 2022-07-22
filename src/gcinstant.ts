//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

/**
 * Temporary transition code for GCInstant/Amplitude.
 */

import userAgent from "@play-co/user-agent";
import { PlatformWeb, analytics as gcAnalytics } from "@play-co/gcinstant";
import type { ABConfig, AnalyticsProperties, GameConfig, HashFunction } from "@play-co/gcinstant";

import { Analytics, injectSecondaryAnalytics } from "./analytics";
import { decode } from "./links";
import { getPWADisplayMode } from "./pwa";
import { getPlayerId } from "./init";
import { setGCSharePayload } from "./share";
import { internalStorage } from "./storage";
import { getQueryParameters, camelCasePrefix } from "./utils";
import { getBestShareType, isWebview } from "./device";

let gcPlatform: PlatformImpl;

// this should never be fatal.
function getEntryPointData(): AnalyticsProperties.EntryData {
    try {
        // internal share payload format
        const decoded = decode().gcinstant as AnalyticsProperties.EntryData;
        if (decoded) return decoded;

        // else we use the old gcinstant payload handling format.
        const { payload } = getQueryParameters();
        if (payload) {
            return JSON.parse(payload);
        }
    } catch (error) {
        console.error("Failed to decode gcinstant payload", error);
    }
    return {} as AnalyticsProperties.EntryData;
}

// we invoke this on load because the URL will get stripped when playpass inits. 
export const entryPointData = getEntryPointData();

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

    /** If gcinstant is set, use that. Otherwise fallback on the default gcinstant handling for `payload` */
    public override _getEntryPointDataForce(): AnalyticsProperties.EntryData {
        return entryPointData;
    }
}


export class AmplitudeAnalytics implements Analytics {
    track (name: string, props?: Record<string,unknown>) {
        gcAnalytics.pushEvent(name, props);
    }

    setUserProperties (props: Record<string,unknown>) {
        const amplitudeUserProps = {...props};

        if (amplitudeUserProps.featureFlags) {
            // amplitude doesn't support featureFlags in a {key: value} format, so we flatten it into an array.
            const flattenedFeatureFlags = Object.entries(props.featureFlags as Record<string, unknown>).reduce((acc, [key, val]) => {
                if(val) {
                    acc.push(key);
                }
                return acc;
            }, [] as string[]);
            amplitudeUserProps.featureFlags  = flattenedFeatureFlags;
        }

        gcAnalytics.setUserProperties(amplitudeUserProps);
    }
}

export async function initGCInstant (
    opts?: { 
        amplitude: string, 
        abTestConfig?: ABConfig, 
        hashFunction?: HashFunction, 
        entryFinalProperties?: {
            eventProperties?: {[key: string]: unknown},
            firstEntryUserProperties?: {[key: string]: unknown},
            lastEntryUserProperties?: {[key: string]: unknown},
        },
        version?: string,
    },
): Promise<void> {
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
        version: opts?.version || "0.0.0",
    });

    if (!!opts?.abTestConfig && !!opts?.hashFunction) {
        await gcPlatform.loadStorage();
        
        gcPlatform.abTests?.initialize(opts.abTestConfig, opts.hashFunction);
    }

    // Send an EntryFinal to Amplitude
    await gcPlatform.startGameAsync();

    const entryFinalProperties = opts?.entryFinalProperties;
    await sendEntryFinalAnalytics(
        entryFinalProperties?.eventProperties || {}, 
        entryFinalProperties?.firstEntryUserProperties || {},  
        entryFinalProperties?.lastEntryUserProperties || {});

    // Inject GCInstant-specific link parameters
    setGCSharePayload(getGCSharePayload());
}

function sendEntryFinalAnalytics (
    entryFinalEventProperties: Record<string,unknown>,
    firstEntryUserProperties: Record<string,unknown>,
    lastEntryUserProperties: Record<string,unknown>,
): Promise<void> {
    const bestShareType = getBestShareType();
    const app = bestShareType == "any" ? null : bestShareType;
    const webview = isWebview();

    let referrer = null;
    let toplevelHost = null;
    if (document.referrer) {
        referrer = new URL(document.referrer);
        toplevelHost = referrer.hostname.split(".").slice(-2).join(".");
    }

    const trackProps = decode().trackProps;

    const standardEntryFinalEventProperties: Record<string,unknown> = {
        href: document.location.href,
        path: document.location.pathname.toLowerCase(),
        isWebview: webview,
        detectedSocialApp: app,
        userAgent: navigator.userAgent,
        referrerHost: referrer?.hostname,
        referrerToplevelHost: toplevelHost,
        referrerHref: referrer?.href,

        // ... shareOriginApp, feature, subFeature
        ...trackProps,
    };

    const standardFirstEntryUserProperties: Record<string,unknown> = {};
    const standardLastEntryUserProperties: Record<string,unknown> = {};

    // Generate firstEntry* and lastEntry* user properties based on the EntryFinal event props
    for (const key in standardEntryFinalEventProperties) {
        const value = standardEntryFinalEventProperties[key];
        standardFirstEntryUserProperties[camelCasePrefix("firstEntry", key)] = value;
        standardLastEntryUserProperties[camelCasePrefix("lastEntry", key)] = value;
    }

    return gcPlatform.sendEntryFinalAnalytics(
        { ...standardEntryFinalEventProperties, ...entryFinalEventProperties },
        { ...standardFirstEntryUserProperties, ...firstEntryUserProperties },
        { ...standardLastEntryUserProperties, ...lastEntryUserProperties });
}

export function getBucketId(testId: string): string | undefined {
    return gcPlatform.abTests?.getBucketID(testId);
}

export function assignTestManually(testId: string, bucketId?: string): void {
    gcPlatform.abTests?.assignTestManually(testId, bucketId);
}

function getGCSharePayload() {
    // Due to size constraints on link shortener we strip out a lot of gcinstants default payload and only use the parts we need.
    const gcinstantSharePropertyWhitelist = [
        "playerID",
        "$firstEntryGeneration",
        "$firstEntryChannel",
        /\$?zeroEntry/,
    ];
    // we filter this because of size constraints.
    const payload = gcPlatform ? gcPlatform.getPlatformPayloadData() : {};
    const filteredPayload = Object.entries(payload).reduce((acc, [key, val]) => {
        const matchFound = !!gcinstantSharePropertyWhitelist.find(matcher => {
            if(matcher instanceof RegExp) return matcher.test(key);
            else return matcher === key;
        });
        if(matchFound) {
            acc[key] = val;
        }
        return acc;
    }, {} as Record<string, string>);
    return filteredPayload;
}
