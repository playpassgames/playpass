import { EMPTY, GuessSymbols } from "./keyState";
import "./keyboard-element.css";

/**
 * Default Keyboard layout
 */
const template = `
<div>
    <div>Q</div>
    <div>W</div>
    <div>E</div>
    <div>R</div>
    <div>T</div>
    <div>Y</div>
    <div>U</div>
    <div>I</div>
    <div>O</div>
    <div>P</div>
</div>
<div>
    <div>A</div>
    <div>S</div>
    <div>D</div>
    <div>F</div>
    <div>G</div>
    <div>H</div>
    <div>J</div>
    <div>K</div>
    <div>L</div>
</div>
<div>
    <div style="width: 65px">Enter</div>
    <div>Z</div>
    <div>X</div>
    <div>C</div>
    <div>V</div>
    <div>B</div>
    <div>N</div>
    <div>M</div>
    <div style="width: 65px">Delete</div>
</div>
`;

// https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
export class Keyboard extends HTMLElement {
    constructor () {
        super();

        this.addEventListener("click", event => {
            if (event.target.childElementCount == 0) {
                const key = event.target.textContent;
                this.dispatchEvent(new CustomEvent("key", { detail: key }));
            }
        });

        window.addEventListener("keydown", event => {
            let key;
            switch (event.key) {
            case "Enter":
                key = "Enter";
                break;
            case "Backspace": case "Delete":
                key = "Delete";
                break;
            default:
                if (event.key.length == 1) {
                    const charCode = event.key.toUpperCase().charCodeAt(0);
                    if (charCode >= 65 && charCode <= 90) {
                        key = String.fromCharCode(charCode);
                    }
                }
            }
            if (key) {
                this.dispatchEvent(new CustomEvent("key", { detail: key }));
            }
        });
        
        this.innerHTML = template;
    }

    setState({words, marks}) {
        const charStates = Array.from(Array(26), () => EMPTY);
        const ccA = "A".charCodeAt(0);

        for (let w = 0; w < marks.length; w++) {
            for (let i = 0; i < words[w].length; i++) {
                const c = words[w].charCodeAt(i) - ccA;
                const newMarkPriority = GuessSymbols.indexOf(marks[w][i]);

                if (newMarkPriority > GuessSymbols.indexOf(charStates[c])) {
                    charStates[c] = marks[w][i];
                }
            }
        }

        for (let row = 0; row < this.children.length; row++) {
            for (let btn = 0; btn < this.children.item(row).children.length; btn++) {
                const key = this.children.item(row).children.item(btn);
                if (key.textContent.length === 1) {
                    const ccId = key.textContent.charCodeAt(0) - ccA;
                    key.setAttribute("s", charStates[ccId]);
                }
            }
        }
    }
}

export const keyboardTag = "word-game-keyboard";

window.customElements.define(keyboardTag, Keyboard);
