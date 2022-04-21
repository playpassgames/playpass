import { DICE_EMOJI } from './utils';
import './View.css';
import PropTypes from 'prop-types';

function rollDice() {
    // Generate 3 random dice
    return [
        DICE_EMOJI[Math.floor(Math.random()*6)],
        DICE_EMOJI[Math.floor(Math.random()*6)],
        DICE_EMOJI[Math.floor(Math.random()*6)],
    ];
}

export function PlayView({onFinish}) {
    return (
      <div className="screen" id="playingScreen">
        <p>Test your luck with three dice. How high can you roll?</p>
        <button id="rollBtn" onClick={() => {
            onFinish(rollDice());
        }}>🎲🎲🎲 Roll &apos;em!</button>
      </div>
    );
}

PlayView.propTypes = {
  onFinish: PropTypes.func,
}