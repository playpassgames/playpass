//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { requireReplicantClient } from "./login";

export interface Leaderboard {
    /** The unique name of this leaderboard. */
    readonly name: string;

    /** Get the number of records in this leaderboard. */
    countRecords (): Promise<number>;

    /**
     * List the top 50 records in this leaderboard, ordered by score.
     *
     * ```javascript
     * const records = await leaderboard.listRecords();
     * for (const record of records) {
     *     console.log(`Rank ${record.rank} is ${record.profileData?.name || "Anonymous"}`);
     * }
     * ```
     */
    listRecords (opts?: ListRecordsOptions): Promise<LeaderboardRecord[]>;

    /**
     * Get the records for a given set of player IDs. Use {@link account.getPlayerId} to get the
     * player ID of the local player.
     *
     * ```javascript
     * const records = await leaderboard.getRecords([ playerId1, playerId2 ]);
     * ```
     */
    getRecords (players: Iterable<string>): Promise<LeaderboardRecord[]>;

    /**
     * Submit a record for the player.
     *
     * A previously submitted record will only be replaced if the new record is "better" (score
     * either higher or lower) than the previous submission.
     *
     * @param score The score number, which will be truncated to an integer. If you need decimals,
     * consider multiplying the score by a fixed amount while submitting and dividing back when
     * displaying the leaderboard.
     */
    submitScore (score: number, opts?: SubmitScoreOptions): void;
}

/** Options to {@link Leaderboard.listRecords}. */
export type ListRecordsOptions = {
    /** Whether lower scores should be considered better, defaults to false. */
    lowerIsBetter?: boolean;
};

/** Options to {@link Leaderboard.submitScore}. */
export type SubmitScoreOptions = {
    /** Whether lower scores should be considered better, defaults to false. */
    lowerIsBetter?: boolean;

    /** Custom data to attach to this record. */
    recordData?: unknown;
};

/** A single leaderboard entry. */
export interface LeaderboardRecord {
    /** The rank of this record in the leaderboard. */
    rank: number;

    /** The score of this record. */
    score: number;

    /** Additional custom data attached to this record. */
    recordData?: unknown;

    /** The player ID that submitted this score. */
    playerId: string;

    /**
     * The custom profile data of this player.
     *
     * See {@link setProfileData} for setting the local player's profile data.
     */
    profileData?: unknown;
}

class LeaderboardImpl implements Leaderboard {
    constructor (public readonly name: string) {
    }

    countRecords (): Promise<number> {
        return requireReplicantClient("Leaderboard.countRecords").leaderboards.getRecordCount({
            leaderboardId: this.name,
        });
    }

    listRecords (opts?: ListRecordsOptions) {
        return requireReplicantClient("Leaderboard.listRecords").leaderboards.listRecords({
            leaderboardId: this.name,
            lowerIsBetter: !!opts?.lowerIsBetter,
        });
    }

    getRecords (players: Iterable<string>) {
        return requireReplicantClient("Leaderboard.getRecords").leaderboards.getRecords({
            leaderboardId: this.name,
            playerIds: Array.from(new Set(players)),
        });
    }

    submitScore (score: number, opts?: SubmitScoreOptions) {
        requireReplicantClient("Leaderboard.submitScore").leaderboards.submitRecord({
            leaderboardId: this.name,
            score: score,
            lowerIsBetter: !!opts?.lowerIsBetter,
            recordData: opts?.recordData ?? null,
        });
    }
}

// export function getProfileData (): unknown {
//     requireReplicantClient("playpass.leaderboards.getProfileData").leaderboards.getProfileData();
// }

/**
 * Update this player's leaderboard profile. The profile is a custom object, which may contain the
 * name, country, favorite color, etc. Collecting and displaying this information is up to the game
 * developer.
 *
 * The profile data of other players is viewable in {@link LeaderboardRecord.profileData}.
 */
export function setProfileData (profileData: unknown): void {
    void requireReplicantClient("playpass.leaderboards.setProfileData").leaderboards.setProfileData({ profileData });
}

/** Gets a leaderboard with the given unique name. */
export function getLeaderboard (name: string): Leaderboard {
    return new LeaderboardImpl(name);
}
