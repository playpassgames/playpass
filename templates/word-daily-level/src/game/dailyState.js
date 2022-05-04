import { DailyModel } from "../addons/daily/daily";

export default class extends DailyModel {
    data() {
        return {
            ...super.data(),
            words: [""],
            marks: [],
        };
    }
}
