import { Model } from "../addons/boilerplate/state";

export default class extends Model {
    constructor(maxAttempts) {
        super();

        this.attempts = maxAttempts;
    }

    data() {
        return {
            wins: new Array(this.attempts).fill(0), // wins count for each successful attempt
        };
    }
}
