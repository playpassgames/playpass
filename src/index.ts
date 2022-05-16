//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

export { analytics } from "./analytics";
export { getLinkData } from "./links";
export { init } from "./init";
export { copyToClipboard, createLink, share } from "./share";
export { storage } from "./storage";
export { createFeatureFlag, featureFlagIsEnabled, setFeatureFlagEnabled } from "./featureFlags";

export * as account from "./exports/account";
export * as groups from "./exports/groups";

/** @hidden */
export * as payments from "./exports/payments";

export type { Analytics } from "./analytics";
export type { FeatureFlagOptions } from "./featureFlags";
export type { InitOptions } from "./init";
export type { ShareType, ShareOptions, CreateLinkOptions } from "./share";
export type { Storage } from "./storage";
