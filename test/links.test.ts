//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import "fake-indexeddb/auto";

import { encode, decodeRaw } from "../src/links";

describe("links", () => {
    it("should encode/decode payloads", () => {
        const encoded = encode({ data: 123 });
        expect(encoded).toBe("http://localhost/#/?link=%7B%22data%22%3A123%7D");

        const decoded = decodeRaw(encoded);
        expect(decoded.data).toBe(123);

        expect(decodeRaw("https://blingo.gg/some/deep/path#/?link=%7B%22data%22%3A123%7D").data).toBe(123);
    });

    it("should handle links with no payload", () => {
        const decoded = decodeRaw("https://blingo.gg");
        expect(decoded.data).toBe(undefined);
    });

    it("should handle malformed links", () => {
        const decoded = decodeRaw("https://blingo.gg/#HELLO");
        expect(decoded.data).toBe(undefined);

        expect(() => decodeRaw("https://blingo.gg/#/?link=WAT")).toThrowError();
    });

    it("should handle legacy links", () => {
        const decoded = decodeRaw("https://blingo.gg/#%7B%22channel%22:%22BRAG%22,%22referrer%22:%22player_iN86xqIEiUHjfSzBHHsOSi%22,%22gcinstant%22:%7B%22$channel%22:%22BRAG%22,%22playerID%22:%22player_iN86xqIEiUHjfSzBHHsOSi%22%7D%7D");
        expect(decoded.channel).toBe("BRAG");
        expect(decoded.gcinstant!.playerID).toBe("player_iN86xqIEiUHjfSzBHHsOSi");
    });

    it("should prioritize new links over legacy", () => {
        const decoded = decodeRaw("https://blingo.gg/#%7B%22channel%22:%22OLD%22%7D?link=%7B%22channel%22:%22NEW%22%7D");
        expect(decoded.channel).toBe("NEW");
    });
});
