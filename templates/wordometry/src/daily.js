import * as playpass from "playpass";

export class Daily {
    constructor () {
        this.day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    }

    /** Loads an object from storage, returning null if there was no object previously saved today. */
    async loadObject () {
        const daily = await playpass.storage.get("daily");
        return (daily && daily.day == this.day) ? daily.state : null;
    }

    /** Saves an object to storage, which will expire the next day. */
    async saveObject (state) {
        await playpass.storage.set("daily", { day: this.day, state: state });
    }

    /** Gets a random number between 0 and 1 unique to this day. */
    random () {
        return ((1103515245*this.day + 12345) >>> 0) / 0xffffffff;
    }

    /** Gets the number of seconds remaining until the next day. */
    timeUntilNextLevel () {
        // TODO(2022-04-19): Return seconds until next day
        return 0;
    }
}
