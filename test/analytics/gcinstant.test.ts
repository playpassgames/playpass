//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { AmplitudeAnalytics } from "../../src/gcinstant";
import * as gcinstant from "@play-co/gcinstant";

jest.mock("@play-co/gcinstant", () => {
    const old = jest.requireActual("@play-co/gcinstant");
    return {
        ...old,
        analytics: {
            setUserProperties: jest.fn(),
        },
    };
});

jest.mock("../../src/storage/idb-storage", () => {
    return {
        IDBStorage: class {
            get = jest.fn();
            set = jest.fn();
        }
    };
});


describe("GCinstant analytics", () => {
    it("Should flatten the feature flags when they are set", async () => {
        const analytics = new AmplitudeAnalytics();

        analytics.setUserProperties({
            userId: "123",
            featureFlags: {
                "feature-1": true,
                "feature-2": false,
            }
        });

        expect(gcinstant.analytics.setUserProperties).toHaveBeenCalledWith({
            userId: "123",
            featureFlags: ["feature-1"]
        });
    });

    it("Should set user properties when no feature flags are set", async () => {
        const analytics = new AmplitudeAnalytics();

        analytics.setUserProperties({
            userId: "123",
        });

        expect(gcinstant.analytics.setUserProperties).toHaveBeenCalledWith({
            userId: "123",
        });
    });
});
