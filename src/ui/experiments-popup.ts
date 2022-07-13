//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { map } from "lit/directives/map.js";

import { popupCss, Popup } from "./popup";

import { experiments } from "../experiments";

@customElement("playpass-experiments")
export class ExperimentsPopup extends Popup {
    static override styles = [
        popupCss,
    ];

    onResetClick(e) {
        e.preventDefault();
        experiments.clearDebug();
    }

    override renderPopup () {
        function buildOption(activeVariant, variant) {
            return html`
                <option
                    ${ variant.id === activeVariant ? "selected" : ""}
                    value="${variant.id}"
                >
                    ${variant.id}
                </option>
            `;
        }

        function buildSelect(experiment) {
            const active = experiments.getActiveVariant(experiment.id);
            return html`
                <div>
                    <label>${experiment.id}</label>
                    <select @change="${(e) => experiments.putInVariant(experiment.id, e.target.value)}">
                        ${map(
        experiment.variants,
        (variant) => buildOption(active, variant),
    )}
                    </select>
                </div>
            `;
        }

        return html`
            <h1>
                Experiments
            </h1>
            ${map(experiments.getExperiments(), buildSelect)}
            <button @click="${this.onResetClick}">
                Reset
            </button>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "playpass-experiments": ExperimentsPopup;
    }
}
