import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './private/App'

import * as playpass from 'playpass';

function getCurrentDay () {
    return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
}

async function onSaveResult(result) {
    await playpass.storage.set("lastDay", getCurrentDay());
    await playpass.storage.set("lastDice", result);
}

(async () => {
    await playpass.init({
        gameId: "YOUR_GAME_ID",
    });

    const sawTutorial = await playpass.storage.get("sawTutorial");
    if (!sawTutorial) {
        await playpass.storage.set("sawTutorial", true);
    }

    const lastDay = await playpass.storage.get("lastDay");
    let currentResult = null;
    if (lastDay == getCurrentDay()) {
        // The player has already played today, load the dice and show the results screen
        currentResult = await playpass.storage.get("lastDice");
    } 

    ReactDOM.render(
        <React.StrictMode>
        <App showTutorial={!sawTutorial} currentResult={currentResult} onSaveResult={onSaveResult} />
        </React.StrictMode>,
        document.getElementById('root')
    )
})();
