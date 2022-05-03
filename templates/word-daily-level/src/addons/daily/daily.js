import * as playpass from "playpass";
import { getCurrentDay, getDay } from "./timer";

/**
 * A daily state manager
 */
export class Daily {
    constructor (firstDate) {
        this.day = getCurrentDay() - getDay(firstDate);
    }

    /** 
     * Defines the base object for user state
     * 
     * Override with your own implementation to customize what is persisted
     * @abstract
     */
    data() {
        return {};
    }

    /** 
     * User state fields will be overwritten daily with what is returned by function.
     * 
     * Override with your own implementation to customize what is stored
     * @abstract
     */
    daily() {
        return {};
    }

    /**
     * A fresh representation of a user's state
     * 
     * @returns 
     */
    newState() {
        return {
            currentStreak: 0,
            maxStreak: 0,
            ...this.data(),
            ...this.daily(),
        };
    }

    /** Loads an object from storage, returning null if there was no object previously saved today. */
    async loadObject () {
        const state = await playpass.storage.get("daily");
        const newState = this.newState();
        if (!state) {
            return {
                ...newState,
                day: this.day
            };
        } else if (state.day !== this.day) {
            return {
                ...newState,
                ...state,
                ...this.daily(),
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
}
