import './View.css';
import PropTypes from 'prop-types';

export function HelpView({onClose}) {
    return (
      <div className="screen" id="helpScreen">
        <h2>Welcome to Daily Dice!</h2>
        <p>This is an example of how to use the Playpass SDK to build a simple daily level game.</p>
        <p>Each day, you have the opportunity to roll a set of 3 dice. If you get a good roll, share it with a friend!</p>
        <button id="helpBackBtn" onClick={onClose}>Continue</button>
      </div>
    );
}

HelpView.propTypes = {
  onClose: PropTypes.func,
};