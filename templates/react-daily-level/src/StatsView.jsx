import './View.css';
import PropTypes from 'prop-types';

export function StatsView({onClose}) {
    return (
        <div className="screen" id="statsScreen">
            <h2>Stats</h2>
            <p>You have rolled 999 points over 123 days.</p>
            <button id="statsBackBtn" onClick={onClose}>Back</button>
        </div>
    );
}

StatsView.propTypes = {
    onClose: PropTypes.func,
}