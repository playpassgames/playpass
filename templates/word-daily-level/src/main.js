import * as playpass from "playpass";
import "./style.css";

// register keyboard component
import "./addons/words/keyboard";
import { KeyboardTag } from "./addons/words/keyboard";

import { Grid, GridTag } from "./addons/words/grid";
import { getHoursUntil, getMinutesUntil, getNextGameTime, getSecondsUntil } from "./addons/daily/timer";
import { ALLOWED_ATTEMPTS } from "./consts";
import { DailyWordGame } from "./game/dailyWordGame";

let daily = null;
let words = [];
let correctAnswer = null;
let state = null;

const grid = document.getElementsByTagName(GridTag)[0];
grid.attempts = ALLOWED_ATTEMPTS;

const keyboard = document.getElementsByTagName(KeyboardTag)[0];
keyboard.addEventListener("key", event => {

    if (Grid.isSolved(state) || state.marks.length === ALLOWED_ATTEMPTS) {
        return;
    }

    const key = event.detail;
    const word = state.words[state.words.length - 1];

    if (key == "Enter") {
        if (word.length !== correctAnswer.length) {
            alert("Not enough letters");
        } else if (words.includes(word)) {
            const result = Grid.getMarks(word, correctAnswer);
            state.marks.push(result);
            if (Grid.isSolved(state)) {
                state.wins[state.words.length-1]++;
                showResultScreen();
            } else if (state.words.length < ALLOWED_ATTEMPTS) {
                state.words.push([""]);
            } else {
                showResultScreen();
            }

            daily.saveObject(state);
        } else {
            alert("Invalid word: "+word+". Try another one!");
        }

    } else if (key == "Delete") {
        if (word.length) {
            state.words[state.words.length - 1] = word.substring(0, word.length -1);
        }
    } else {
        if (word.length < correctAnswer.length) {
            state.words[state.words.length - 1] = word + key;
        }
    }
    grid.setState(state);
    keyboard.setState(state);
});

// Shows either the results or gameplay screen
async function showMainScreen () {
    grid.setState(state);
    keyboard.setState(state);
    if (Grid.isSolved(state) || Grid.isLost(state)) {
        showResultScreen();
    } else {
        // The player hasn't yet won today, show the playing screen
        showScreen("#playingScreen");
    }
}

function updateClock() {
    const next = getNextGameTime();
    const h = getHoursUntil(next);
    const m = getMinutesUntil(next);
    const s = getSecondsUntil(next);
    document.querySelector("#timeLeft").textContent = h + "h " +
        m.toString().padStart(2,0) + "m "+s.toString().padStart(2, 0) + "s";
}

updateClock();

setInterval(updateClock, 1000);

function showResultScreen () {
    // Go to the results screen
    showScreen("#resultScreen");

    // Set the first results line
    document.querySelector("#resultLine1").textContent = Grid.isSolved(state) ?
        "You guessed today's word!" : ("You couldn't guess today's word: " + correctAnswer);
}

function showScreen (name) {
    for (let screen of document.querySelectorAll(".screen")) {
        screen.style.display = "none";
    }
    document.querySelector(name).style.display = "inherit";
    if (Grid.isSolved(state) || Grid.isLost(state)) {
        if (name === "#resultScreen") {
            document.querySelector("#playingScreen").style.display = "inherit";
        }
    }
}

function onShareClick () {
    // Create a link to our game
    const link = playpass.createLink();

    // Share some text along with our link
    const text = "Daily Word #" + (daily.day + 1) + " " + (Grid.isLost(state) ? "X" : state.marks.length.toString()) +
        "/6\n\n" + state.marks.map(
        str => str.replace(/n/g, "⬜").replace(/b/g, "🟩").replace(/c/g, "🟨"))
        .join("\n") + "\n\n" + link;

    playpass.share({ text });
}

function onHelpClick () {
    showScreen("#helpScreen");
}

function onStatsClick () {
    const numWins = state.wins.reduce((cur, prev) => (cur + prev) || 0, 0);
    document.querySelector("#winStats").textContent = `You won ${numWins} times.`;
    showScreen("#statsScreen");
}

function onSettingsClick () {
    showScreen("#settingsScreen");
}

function onBackClick () {
    showMainScreen();
}

async function onLoginClick () {
    if (await playpass.account.login()) {
        document.body.classList.add("isLoggedIn");
    }
}

function onLogoutClick () {
    playpass.account.logout();
    document.body.classList.remove("isLoggedIn");
}

(async function () {
    // Initialize the Playpass SDK
    await playpass.init({
        gameId: "YOUR_GAME_ID", // Do not edit!
    });

    // Initialize today's game
    daily = new DailyWordGame(Date.parse("2022-04-21T12:00:00"));

    // Get the dictionary of words
    const dictionary = await import("../content/dictionary.json");

    // correct case sensitivity
    words = dictionary.words.map(w => w.toUpperCase());

    // allow only a subset of all words in the dictionary to be possible answers
    const choices = (dictionary.choices && dictionary.choices.length > 0)
        ? dictionary.choices.map(w => w.toUpperCase())
        : words;

    // merge both sets just in case there are answers that aren't in the allowed list
    words = Array.from(new Set([
        ...words,
        ...choices,
    ]));

    const todaysAnswer = dictionary.lookup[daily.day.toString()] || choices[daily.day % words.length];

    if (typeof todaysAnswer === "string") {
        correctAnswer = todaysAnswer;
    } else {
        correctAnswer = todaysAnswer.word;
        document.querySelector("#hint").textContent = `hint: ${todaysAnswer.hint}`;
    }

    correctAnswer = correctAnswer.toUpperCase();

    grid.word = correctAnswer;

    // Get the stored state
    state = await daily.loadObject();

    // Take new users to help screen first
    const sawTutorial = await playpass.storage.get("sawTutorial");
    if (sawTutorial) {
        showMainScreen();
    } else {
        playpass.storage.set("sawTutorial", true);
        showScreen("#helpScreen");
    }

    // Set the login state for our UI
    if (playpass.account.isLoggedIn()) {
        document.body.classList.add("isLoggedIn");
    }

    // format title prompt based on real content
    document.querySelector("#prompt").textContent = `Try to guess today's ${correctAnswer.length} letter word`;

    // Add UI event listeners
    document.querySelector("#shareBtn").onclick = onShareClick;
    document.querySelector("#helpBtn").onclick = onHelpClick;
    document.querySelector("#helpBackBtn").onclick = onBackClick;
    document.querySelector("#statsBtn").onclick = onStatsClick;
    document.querySelector("#statsBackBtn").onclick = onBackClick;
    document.querySelector("#settingsBtn").onclick = onSettingsClick;
    document.querySelector("#loginBtn").onclick = onLoginClick;
    document.querySelector("#logoutBtn").onclick = onLogoutClick;
    document.querySelector("#settingsBackBtn").onclick = onBackClick;
})();
