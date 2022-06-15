//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt


import { Cohort, Experiments } from "@appannie/ab-testing";

export type UserProfile = Record<string, string>;

export interface Experiment {
    id: string;
    active: boolean;
    variants: Variant[];
}

export interface Variant {
    id: string;
    weight?: number;

    /* additional convenience allocation rules */
    newUser?: boolean;
}

/**
 * Convience service for allowing simple AB Experimenting configuration.
 *
 * Bucketing can be overridden locally to test the effects of each variant
 */
class ExperimentService {
    private experiments: Experiment[] = [];
    private salt = "salt";
    private offlineExperiments: Record<string, string> = {};

    private provider: Experiments | null = null;
    private _ready = false;

    init(experiments: Experiment[], userId = "guest", profile: UserProfile = {}, salt = "salt") {
        this.experiments = experiments;
        this.salt = salt;

        if (localStorage.getItem("debug") === "true") {
            this.load();
        }

        this._ready = true;

        const config = this.experiments.map((e) => {
            let allocationRange = 0;
            let controlExists = false;
            const cohorts: Cohort[] = e.variants.map((b) => {
                if (b.id === "control") {
                    controlExists = true;
                }
                const sampleSize = b.weight ? 100 * b.weight : 0;
                // allocate to a specific weight or evenly distribute with what is available for allocation
                const allocation = sampleSize > 0 ? [ [allocationRange, sampleSize] as [number, number] ] : undefined;
                allocationRange += sampleSize;

                const allocation_criteria = {};

                if (b.newUser !== undefined) {
                    Object.assign(allocation_criteria, { newUser: b.newUser });
                }

                return {
                    name: b.id,
                    allocation,
                    allocation_criteria,
                };
            });

            if (allocationRange > 100) {
                throw new Error("Experiment variants improperly allocated.  Sum of weights must be less than or equal to 1.0");
            }

            if (!controlExists) {
                // make sure there's a control variant that gets the rest of the allocation
                cohorts.push({
                    name: "control",
                });
            }

            return {
                name: e.id,
                cohorts,
            };
        });

        this.provider = new Experiments({
            version: "1.0",
            salt: this.salt,
            experiments: config,
        }, userId, profile);
    }

    get ready() {
        return this._ready;
    }

    getExperiments() {
        return this.experiments.filter(e => e.active);
    }

    isExperimentActive(id: string) {
        return this.experiments.find((e) => e.id === id)?.active ?? false;
    }

    getActiveVariant(id: string) {
        if (this.isExperimentActive(id)) {
            return this.offlineExperiments[id] ?? this.provider?.getCohort(id) ?? "control";
        }
        return "control";
    }

    isInVariant(id: string, bucket: string) {
        return this.getActiveVariant(id) === bucket;
    }

    getActiveVariants(): Record<string, string> {
        return Object.assign({}, this.provider?.matchedCohorts ?? {});
    }

    putInVariant(experiment: string, bucket = "control") {
        this.provider?.userProfile;
        Object.assign(this.offlineExperiments, { [experiment]: bucket });

        this.save();
    }

    load() {
        const data = JSON.parse(localStorage.getItem("experimentDebugData") ?? "{}");

        this.offlineExperiments = data ?? {};
    }

    save() {
        window.localStorage.setItem("experimentDebugData", JSON.stringify(this.offlineExperiments));
    }

    clearDebug() {
        this.offlineExperiments = {};
        this.save();
    }
}

export const experiments = new ExperimentService();
