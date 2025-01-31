//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

export { analytics } from "./analytics";
export { getLinkData } from "./links";
export { init } from "./init";
export { copyToClipboard, createLink, createContextLink, share, uploadTemporaryImage } from "./share";
export { storage } from "./storage";
export { createFeatureFlag, featureFlagIsEnabled, setFeatureFlagEnabled } from "./featureFlags";

export * as account from "./exports/account";
export * as device from "./exports/device";
export * as groups from "./exports/groups";
export * as leaderboards from "./exports/leaderboards";
export * as notifications from "./exports/notifications";
// export * as serviceWorker from "./exports/serviceWorker";

/** @hidden */
export * as payments from "./exports/payments";

export type { Analytics } from "./analytics";
export type { FeatureFlagOptions } from "./featureFlags";
export type { InitOptions } from "./init";
export type { ShareType, ShareOptions, CreateLinkOptions } from "./share";
export type { Storage } from "./storage";
