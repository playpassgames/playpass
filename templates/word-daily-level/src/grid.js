
// The 5x6 grid of letters
export class Grid {
    static EMPTY = "_";
    static NONE = "n";
    static COW = "c";
    static BULL = "b";
    static GuessSymbols = Grid.EMPTY + Grid.NONE + Grid.COW + Grid.BULL;
    static GuessClasses = ["letterEmpty", "letterNone", "letterCow", "letterBull"];

    static isSolved({marks}) {
        let solved = true;

        if (marks && marks.length) {
            for (let c of marks[marks.length - 1]) {
                if (c !== Grid.BULL) {
                    solved = false;
                    break;
                }
            }
        } else {
            solved = false;
        }
        return solved;
    }

    static isLost(state) {
        const {marks} = state;
        return marks && marks.length === 6 && !Grid.isSolved(state);
    }

    static getMarks(_guess, _word) {
        const word = Array.from(_word);
        const guess = Array.from(_guess);
        const len = word.length;
        const marks = Array.from(Array(len), () => Grid.NONE);

        // Bulls
        for (let i = 0; i < len; i++) {
            if (guess[i] === word[i]) {
                marks[i] = Grid.BULL;
                word[i] = "_";
                guess[i] = "_";
            }
        }
        // Cows
        for (let i = 0; i < len; i++) {
            if (guess[i] !== "_") {
                const it = word.indexOf(guess[i]);

                if (it >= 0) {
                    marks[i] = Grid.COW;
                    guess[i] = "_";
                    word[it] = "_";
                }
            }
        }

        return marks.join("");
    }

    setState({words, marks}) {
        const grid = document.getElementsByClassName("grid")[0];
        for (let row = 0; row < words.length; row++) {
            for (let letter = 0; letter < 5; letter++) {
                const cell = grid.children.item(row).children.item(letter);
                cell.textContent = words[row][letter];
                let mark = Grid.EMPTY;
                if (marks[row]) {
                    mark = marks[row][letter] || mark;
                }
                cell.classList = Grid.GuessClasses[Grid.GuessSymbols.indexOf(mark)];
            }
        }
    }
}
