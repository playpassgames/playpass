//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import "fake-indexeddb/auto";

import { analytics } from "../../src";
import * as links from "../../src/links";
import { IDBStorage } from "../../src/storage/idb-storage";

import * as playpass from "../../src";

describe("feature flag tests", () => {
    // Hide noisy console logs:
    console.error = jest.fn();
    console.warn = jest.fn();

    let flags = {};

    const mockDbGet = jest.spyOn(IDBStorage.prototype, "get").mockImplementation((key: string) => Promise.resolve(key === "featureFlags" ? flags : undefined));
    const mockDbSet = jest.spyOn(IDBStorage.prototype, "set").mockImplementation((key: string, value: unknown) => {
        if (key === "featureFlags") {
            flags = value as Record<string, boolean>;
        }
        return Promise.resolve();
    });

    // handles window method on playpass.init()
    // jest.spyOn(pwa, 'getPWADisplayMode').mockReturnValue('browser');

    const mockPayload = {
        featureFlags: {
            "testFlag": true,
            "testFlag2": false,
            "testFlag3": true,
        },
        gcinstant: {}
    };
    location.href = links.encode(mockPayload);
    const analyticsMock = jest.spyOn(analytics, "setUserProperties");
    // jest.spyOn(links, 'decode').mockReturnValue(mockPayload);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("includes decoded payload in feature flag initialization", async () => {
        await playpass.init();
        expect(mockDbGet).toHaveBeenCalledWith("featureFlags");
        expect(analyticsMock).toBeCalledWith({featureFlags: ["testFlag", "testFlag3"]});
        expect(mockDbSet).toBeCalled();
    });
});

