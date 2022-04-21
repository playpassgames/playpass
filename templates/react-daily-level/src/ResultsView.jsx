import { DICE_EMOJI } from './utils';
import './View.css';
import PropTypes from 'prop-types';

import * as playpass from 'playpass';

function onShareClick (result) {
    // Create a link to our game
    const link = playpass.createLink();

    // Share some text along with our link
    playpass.share({
        text: "Today's dice " + result.join(" ") + " " + link,
    });
}

export function ResultsView({result}) {
    let points = 0;
    for (const die of result) {
        points += DICE_EMOJI.indexOf(die) + 1;
    }
    const pointsText = result.join(" + ") + " = " + points;

    // Set the second results line
    let rank;
    if (points > 16) {
        rank = "LEGENDARY LUCK!";
    } else if (points > 14) {
        rank = "Golden Luck!";
    } else if (points > 12) {
        rank = "Favored Luck";
    } else if (points > 10) {
        rank = "Average Luck";
    } else if (points > 8) {
        rank = "Slightly Unlucky";
    } else if (points > 6) {
        rank = "Luckless";
    } else if (points > 4) {
        rank = "Unfavored Luck";
    } else if (points > 2) {
        rank = "Disastrous Luck!";
    } else {
        rank = "CURSED!";
    }

    return (
      <div className="screen" id="resultScreen">
        <p>Your dice rolls today were...</p>
        <h1 id="resultLine1">{pointsText}</h1>
        <h2 id="resultLine2">{rank}</h2>
        <button id="shareBtn" onClick={() => onShareClick(result)}>🗨️ Share</button>
        <p><span id="timeLeft">12h 34m 56s</span> until next roll</p>
      </div>
    );
}

ResultsView.propTypes = {
    result: PropTypes.any,
}