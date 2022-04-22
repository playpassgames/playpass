// TODO(2022-04-19): Use a custom Web Component for this?
import { Grid } from "./grid";

// https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
export class Keyboard extends EventTarget {
    constructor (element) {
        super();

        element.addEventListener("click", event => {
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
    }
    setState({words, marks}) {
        const charStates = Array.from(Array(26), () => Grid.EMPTY);
        const ccA = "A".charCodeAt(0);

        for (let w = 0; w < marks.length; w++) {
            for (let i = 0; i < words[w].length; i++) {
                const c = words[w].charCodeAt(i) - ccA;
                const newMarkPriority = Grid.GuessSymbols.indexOf(marks[w][i]);

                if (newMarkPriority > Grid.GuessSymbols.indexOf(charStates[c])) {
                    charStates[c] = marks[w][i];
                }
            }
        }

        const keyboard = document.getElementsByClassName("keyboard")[0];
        for (let row = 0; row < keyboard.children.length; row++) {
            for (let btn = 0; btn < keyboard.children.item(row).children.length; btn++) {
                const key = keyboard.children.item(row).children.item(btn);
                if (key.textContent.length === 1) {
                    const ccId = key.textContent.charCodeAt(0) - ccA;
                    key.classList = [Grid.GuessClasses[Grid.GuessSymbols.indexOf(charStates[ccId])]];
                }
            }
        }


    }
}
