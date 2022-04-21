//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { analytics } from "./analytics";
import { decode } from "./links";
import { internalStorage } from "./storage";

/** @hidden */
export type FeatureFlagOptions = {
    percent?: number;
    filter?: () => Promise<boolean>; 
}

let cachedFeatureFlags: Record<string, boolean>;

/** Load feature flags, storing any new ones from the URL payload. */
export async function initFeatureFlags (): Promise<void> {
    cachedFeatureFlags = await internalStorage.get("featureFlags") as Record<string,boolean> || {};

    const payload = decode();
    if (payload.featureFlags) {
        for (const id in payload.featureFlags) {
            cachedFeatureFlags[id] = !!payload.featureFlags[id];
        }
        void internalStorage.set("featureFlags", cachedFeatureFlags);
    }

    setFeatureFlagUserProp();
}

/** @hidden */
export async function createFeatureFlag(name: string, opts?: FeatureFlagOptions): Promise<void> {
    if (!cachedFeatureFlags) {
        throw new Error("Call playpass.init() first");
    }

    if (typeof cachedFeatureFlags[name] === "boolean") {
        // feature flag already set, just return in this case
        return;
    }

    if (!!opts?.filter && !(await opts.filter())) {
        cachedFeatureFlags[name] = false;
    } else {
        // check for percentage, otherwise set at 50%
        const randThreshold = Math.random() * 100;
        const percentage = opts?.percent !== undefined ? opts.percent : 50;    
        const isEnabled = percentage >= randThreshold;
        
        cachedFeatureFlags[name] = isEnabled;
    }

    setFeatureFlagUserProp();
    void internalStorage.set("featureFlags", cachedFeatureFlags);
}

/** @hidden */
export function setFeatureFlagEnabled(name: string, enabled: boolean) {
    if (!cachedFeatureFlags) {
        throw new Error("Call playpass.init() first");
    }

    if (typeof cachedFeatureFlags[name] !== "boolean") {
        throw new Error("featureFlag has not yet been created");
    }

    cachedFeatureFlags[name] = enabled;

    setFeatureFlagUserProp();
    void internalStorage.set("featureFlags", cachedFeatureFlags);
}

/** @hidden Returns true if the user has the given feature flag. */
export function featureFlagIsEnabled (name: string): boolean {
    if (!cachedFeatureFlags) {
        throw new Error("Call playpass.init() first");
    }
    return !!cachedFeatureFlags[name];
}

function setFeatureFlagUserProp() {
    // Put list of feature flags in an Amplitude user property
    const featureFlagArray = [];
    for (const featureFlag in cachedFeatureFlags) {
        if (cachedFeatureFlags[featureFlag]) {
            featureFlagArray.push(featureFlag);
        }
    }

    analytics.setUserProperties({
        featureFlags: featureFlagArray,
    });
}
