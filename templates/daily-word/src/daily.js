import * as playpass from "playpass";
import { getCurrentDay, getDay } from "./timer";

export class Daily {
    constructor (firstDate) {
        this.day = getCurrentDay() - getDay(firstDate);
    }

    /** Loads an object from storage, returning null if there was no object previously saved today. */
    async loadObject () {
        const state = await playpass.storage.get("daily");
        const newState = {
            words: [""],
            marks: [],
            currentStreak: 0,
            maxStreak: 0,
            wins: [0, 0, 0, 0, 0, 0], // wins count for each successful attempt
        };
        if (!state) {
            return {
                ...newState,
                day: this.day
            };
        } else if (state.day !== this.day) {
            return {
                ...newState,
                ...state,
                words: [""],
                marks: [],
                day: this.day
            };
        } else {
            return {
                ...newState,
                ...state
            };
        }
    }

    /** Saves an object to storage, which will expire the next day. */
    async saveObject (state) {
        await playpass.storage.set("daily", state);
    }

    /** Gets a random number between 0 and 1 unique to this day. */
    random () {
        return ((1103515245*this.day + 12345) >>> 0) / 0xffffffff;
    }

    /** Gets the number of seconds remaining until the next day. */
    timeUntilNextLevel () {
        return Math.floor(getTimeUntilTomorrowMS() / 1000);
    }
}
