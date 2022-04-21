//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import "fake-indexeddb/auto";

import * as playpass from "../../src";

describe("uninitialized feature flag tests", () => {
    // Hide noisy console logs:
    console.error = jest.fn();
    console.warn = jest.fn();
 
    it("attempts to create feature flag and throws not init error", async () => { 
        await expect(playpass.createFeatureFlag("testFlag")).rejects.toThrowError();
    });
  
    it("attempts to set feature flag and throws not init error", () => {      
        expect(() => playpass.setFeatureFlagEnabled("testFlag", false)).toThrowError();
    });

    it("attempts to check feature flag and throws not init error", () => {      
        expect(() => playpass.featureFlagIsEnabled("testFlag")).toThrowError();
    });
});
