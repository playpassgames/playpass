import * as playpass from "playpass";
import "./style.css";

import { Daily } from "./daily";
import { getRandomWord, isValidWord } from "./dictionary";
import { Keyboard } from "./keyboard";

const daily = new Daily();
const correctAnswer = getRandomWord(daily.random());
let attempts = [];

const triesLeft = document.querySelector("#triesLeft");
const inputWord = document.querySelector("#inputWord");

const hint = document.querySelector("#hint");
hint.textContent = correctAnswer.charAt(Math.floor(daily.random()*inputWord.length));

const keyboard = new Keyboard(document.querySelector(".keyboard"));
keyboard.addEventListener("key", event => {
    const key = event.detail;

    if (key == "Enter") {
        const word = inputWord.textContent;
        if (isValidWord(word)) {
            attempts.push(word);
            if (word == correctAnswer) {
                daily.saveObject(attempts);
                showResultScreen();
            } else {
                inputWord.textContent = "";
                const tries = parseInt(triesLeft.textContent);
                if (tries > 1) {
                    triesLeft.textContent = tries - 1;
                } else {
                    daily.saveObject(attempts);
                    showResultScreen();
                }
            }
        } else {
            alert("Invalid bird: "+word+". Try another one!");
        }

    } else if (key == "Delete") {
        inputWord.textContent = inputWord.textContent.slice(0, -1);

    } else {
        inputWord.textContent += key;
    }
});

// Shows either the results or gameplay screen
async function showMainScreen () {
    attempts = await daily.loadObject();
    if (attempts) {
        showResultScreen();
    } else {
        // The player hasn't yet played today, show the playing screen
        attempts = [];
        showScreen("#playingScreen");
    }
}

function showResultScreen () {
    // Go to the results screen
    showScreen("#resultScreen");

    // Set the first results line
    document.querySelector("#resultLine1").textContent = (attempts[attempts.length-1] == correctAnswer)
        ? "You guessed today's bird!"
        : "Today's bird was " + correctAnswer;

    // Set the second results line
    document.querySelector("#resultLine2").textContent = "Your attempts: " + attempts.join(", ");
}

function showScreen (name) {
    for (let screen of document.querySelectorAll(".screen")) {
        screen.style.display = "none";
    }
    document.querySelector(name).style.display = "inherit";
}

function onShareClick () {
    // Create a link to our game
    const link = playpass.createLink();

    // Share some text along with our link
    // TODO(2022-04-19): More exciting share format
    playpass.share({
        text: "Today's bird in " + attempts.length + " tries 🐦 " + link,
    });
}

function onHelpClick () {
    showScreen("#helpScreen");
}

function onStatsClick () {
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
        gameId: "YOUR_GAME_ID",
    });

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
