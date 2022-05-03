import { BULL, COW, EMPTY, NONE } from "./keyState";
import "./grid-style.css";

// The NxM grid of letters
export class Grid extends HTMLElement {
    constructor(attempts) {
        super();

        this.attempts = attempts;
    }

    set word(word) {
        this.len = word.length;
        this.build();
    }

    static isSolved({marks}) {
        let solved = true;

        if (marks && marks.length) {
            for (let c of marks[marks.length - 1]) {
                if (c !== BULL) {
                    solved = false;
                    break;
                }
            }
        } else {
            solved = false;
        }
        return solved;
    }

    static isLost({marks}) {
        return marks && marks.length === 6;
    }

    static getMarks(_guess, _word) {
        const word = Array.from(_word);
        const guess = Array.from(_guess);
        const len = word.length;
        const marks = Array.from(Array(len), () => NONE);

        // Bulls
        for (let i = 0; i < len; i++) {
            if (guess[i] === word[i]) {
                marks[i] = BULL;
                word[i] = "_";
                guess[i] = "_";
            }
        }
        // Cows
        for (let i = 0; i < len; i++) {
            if (guess[i] !== "_") {
                const it = word.indexOf(guess[i]);

                if (it >= 0) {
                    marks[i] = COW;
                    guess[i] = "_";
                    word[it] = "_";
                }
            }
        }

        return marks.join("");
    }

    build() {
        const cellDimensions = 288 / this.len;

        this.replaceChildren([]);

        for (let row = 0; row < this.attempts; row++) {
            const div = document.createElement("div");
            for (let cell = 0; cell < this.len; cell++) {
                const letter = document.createElement("div");

                letter.classList.add("cell");

                // scale cells based on word length
                letter.style.width = `${cellDimensions}px`;
                letter.style.height = `${cellDimensions}px`;
                letter.style.fontSize = `${cellDimensions / 2}px`;

                div.appendChild(letter);
            }
            this.appendChild(div);
        }
    }

    setState({words, marks}) {
        for (let row = 0; row < words.length; row++) {
            for (let letter = 0; letter < this.len; letter++) {
                const cell = this.children.item(row).children.item(letter);
                cell.textContent = words[row][letter];
                let mark = EMPTY;
                if (marks[row]) {
                    mark = marks[row][letter] || mark;
                }
                cell.setAttribute("s", mark);
            }
        }
    }
}

export const GridTag = "word-game-grid";

window.customElements.define(GridTag, Grid);