import { Daily } from "../addons/daily/daily";
import { ALLOWED_ATTEMPTS } from "../consts";

export class DailyWordGame extends Daily {
    data() {
        return {
            wins: new Array(ALLOWED_ATTEMPTS).fill(0), // wins count for each successful attempt
        };
    }

    daily() {
        return {
            words: [""],
            marks: [],
        };
    }
}
