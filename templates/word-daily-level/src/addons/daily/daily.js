import { Model } from "../boilerplate/state";
import { getCurrentDay, getDay } from "./timer";

/**
 * A daily state manager
 */
export class DailyModel extends Model {
    constructor (firstDate) {
        super();
        this.day = getCurrentDay() - getDay(firstDate);
    }

    data() {
        return {
            day: this.day
        };
    }

    onLoad(state) {
        if (state.day !== this.day) {
            return {
                ...state,
                ...this.data(),
            };
        }
        
        return state;
    }
    
    /** Gets a random number between 0 and 1 unique to this day. */
    random () {
        return ((1103515245*this.day + 12345) >>> 0) / 0xffffffff;
    }
}
