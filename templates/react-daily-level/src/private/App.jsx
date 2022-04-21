import { useState } from 'react';
import './App.css';
import PropTypes from 'prop-types';

import { PlayView } from '../PlayView';
import { StatsView } from '../StatsView';
import { ResultsView } from '../ResultsView';
import { GameTitle } from '../GameTitle';
import { HelpView } from '../HelpView';
import { SettingsView } from '../SettingsView';

function App({showTutorial, currentResult, onSaveResult}) {
  const [result, setResult] = useState(null);

  const [showResults, setShowResults] = useState(currentResult !== null);
  const [showHelp, setShowHelp] = useState(showTutorial);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const showMainScreen = !showHelp && !showStats && !showSettings;
  const showPlayScreen = result === null && currentResult === null;

  function toggleMenu(showState, showFunc) {
    setShowHelp(false);
    setShowSettings(false);
    setShowStats(false);

    showFunc(!showState);
  }

  const screen = showPlayScreen 
    ? <PlayView onFinish={(result) => {
        setResult(result);
        toggleMenu(showResults, setShowResults);
        onSaveResult(result);
    }} />
    : <ResultsView result={result || currentResult} />;

  return (
    <div>
      <header>
        <div id="helpBtn" onClick={() => toggleMenu(showHelp, setShowHelp)}></div>
        <GameTitle />
        <div id="statsBtn" onClick={() => toggleMenu(showStats, setShowStats)}></div>
        <div id="settingsBtn" onClick={() => toggleMenu(showSettings, setShowSettings)}></div>
      </header>

      {showMainScreen && screen}

      {showHelp && <HelpView onClose={() => setShowHelp(false)} />}
      {showSettings && <SettingsView onClose={() => setShowSettings(false)} />}
      {showStats && <StatsView onClose={() => setShowStats(false)} />}
    </div>
  )
}

App.propTypes = {
  showTutorial: PropTypes.bool,
  currentResult: PropTypes.any,
  onSaveResult: PropTypes.func,
};

export default App
