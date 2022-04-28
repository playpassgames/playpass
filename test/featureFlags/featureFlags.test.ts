//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import "fake-indexeddb/auto";

import { analytics } from "../../src";
import { IDBStorage } from "../../src/storage/idb-storage";

import * as playpass from "../../src";

describe("feature flag tests", () => {
    // Hide noisy console logs:
    console.error = jest.fn();
    console.warn = jest.fn();

    let flags: Record<string, boolean> = {};

    jest.spyOn(IDBStorage.prototype, "get").mockImplementation((key: string) => Promise.resolve(key === "featureFlags" ? flags : undefined));
    const mockDbSet = jest.spyOn(IDBStorage.prototype, "set").mockImplementation((key: string, value: unknown) => {
        if (key === "featureFlags") {
            flags = value as Record<string, boolean>;
        }
        return Promise.resolve();
    });

    // handles window method on playpass.init()
    // jest.spyOn(pwa, 'getPWADisplayMode').mockReturnValue('browser');

    const analyticsMock = jest.spyOn(analytics, "setUserProperties");
    // jest.spyOn(links, 'decode').mockReturnValue(mockPayload);

    playpass.init();

    beforeEach(() => {
        jest.clearAllMocks();

        // reset all featureFlags
        for (const member in flags) delete flags[member];
    });

    it("creates feature flag and sets it to true", async () => {
        await playpass.createFeatureFlag("testFlag");
        playpass.setFeatureFlagEnabled("testFlag", true);
        expect(playpass.featureFlagIsEnabled("testFlag")).toBe(true);
        expect(analyticsMock).toBeCalledWith({featureFlags: {testFlag: true}});
        expect(mockDbSet).toBeCalled();
    });

    it("creates feature flag and sets it to false", async () => {
        await playpass.createFeatureFlag("testFlag");
        playpass.setFeatureFlagEnabled("testFlag", false);
        expect(playpass.featureFlagIsEnabled("testFlag")).toBe(false);
        expect(analyticsMock).toHaveBeenLastCalledWith({featureFlags: {testFlag: false}});
        expect(mockDbSet).toBeCalled();
    });

    it("sets feature flag before it is created", () => {
        expect(() => playpass.setFeatureFlagEnabled("testFlag", false)).toThrowError("featureFlag has not yet been created");
    });

    it("creates feature flag using a falsy filter", async () => {
        await playpass.createFeatureFlag("testFlag", {
            filter: async() => {
                return false;
            }
        });

        expect(playpass.featureFlagIsEnabled("testFlag")).toBe(false);
        expect(analyticsMock).not.toBeCalledWith({featureFlags: {testFlag: true}});
        expect(mockDbSet).toBeCalled();
    });

    it("creates feature flag using a truthy filter", async () => {
        await playpass.createFeatureFlag("testFlag", {
            filter: async() => {
                return true;
            }
        });

        expect(playpass.featureFlagIsEnabled("testFlag")).toBeDefined();
        expect(mockDbSet).toBeCalled();
    });

    it("creates feature flag with 100% probability", async () => {
        await playpass.createFeatureFlag("testFlag", {
            percent: 100
        });

        expect(playpass.featureFlagIsEnabled("testFlag")).toBe(true);
        expect(analyticsMock).toBeCalledWith({featureFlags: {testFlag: true}});
        expect(mockDbSet).toBeCalled();
    });

    it("creates feature flag with 0% probability", async () => {
        await playpass.createFeatureFlag("testFlag", {
            percent: 0
        });

        expect(playpass.featureFlagIsEnabled("testFlag")).toBe(false);
        expect(analyticsMock).toBeCalledWith({featureFlags: {testFlag: false}});
        expect(mockDbSet).toBeCalled();
    });

    it("creates feature flag with 100% probability and truthy filter", async () => {
        await playpass.createFeatureFlag("testFlag", {
            percent: 100,
            filter: async() => {
                return true;
            }
        });

        expect(playpass.featureFlagIsEnabled("testFlag")).toBe(true);
        expect(analyticsMock).toBeCalledWith({featureFlags: {testFlag: true}});
        expect(mockDbSet).toBeCalled();
    });

    it("creates feature flag with 100% probability and falsy filter", async () => {
        await playpass.createFeatureFlag("testFlag", {
            percent: 100,
            filter: async() => {
                return false;
            }
        });

        expect(playpass.featureFlagIsEnabled("testFlag")).toBe(false);
        expect(analyticsMock).not.toBeCalledWith({featureFlags: {testFlag: true}});
        expect(mockDbSet).toBeCalled();
    });

    it("creates feature flag with 0% probability and truthy filter", async () => {
        await playpass.createFeatureFlag("testFlag", {
            percent: 0,
            filter: async() => {
                return true;
            }
        });

        expect(playpass.featureFlagIsEnabled("testFlag")).toBe(false);
        expect(analyticsMock).not.toBeCalledWith({featureFlags: {testFlag: true}});
        expect(mockDbSet).toBeCalled();
    });

    it("creates feature flag with 0% probability and falsy filter", async () => {
        await playpass.createFeatureFlag("testFlag", {
            percent: 0,
            filter: async() => {
                return false;
            }
        });

        expect(playpass.featureFlagIsEnabled("testFlag")).toBe(false);
        expect(analyticsMock).not.toBeCalledWith({featureFlags: {testFlag: true}});
        expect(mockDbSet).toBeCalled();
    });
});

