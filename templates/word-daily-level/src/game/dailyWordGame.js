import { Daily } from "../addons/daily/daily";

export class DailyWordGame extends Daily {
    constructor(firstDate, maxAttempts) {
        super(firstDate);

        this.attempts = maxAttempts;
    }

    data() {
        return {
            wins: new Array(this.attempts).fill(0), // wins count for each successful attempt
        };
    }

    daily() {
        return {
            words: [""],
            marks: [],
        };
    }
}
