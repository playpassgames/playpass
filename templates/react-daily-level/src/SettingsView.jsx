import { useState } from 'react';
import './View.css';
import PropTypes from 'prop-types';

import * as playpass from 'playpass';

async function onLoginClick () {
    if (await playpass.account.login()) {
      return true;
    }
    return false;
}

async function onLogoutClick () {
    playpass.account.logout();
}


export function SettingsView({onClose}) {
    const [isLoggedIn, setLoggedIn] = useState(playpass.account.isLoggedIn());

    return (
      <div className="screen" id="settingsScreen">
        <h2>Settings</h2>
        {!isLoggedIn && 
          <div className="showIfLoggedOut">
            <div>Login to save or transfer your game progress.</div>
            <button id="loginBtn" onClick={() => {
              onLoginClick().then(value => setLoggedIn(value))
            }}>📱 Login</button>
          </div>
        }
        {isLoggedIn && 
          <div className="showIfLoggedIn">
            <div>You are logged in, your progress will be saved.</div>
            <button id="logoutBtn" onClick={() => {
              onLogoutClick();
              setLoggedIn(false);
            }}>Logout</button>
          </div>
        }
        <button id="settingsBackBtn" onClick={onClose}>Back</button>
      </div>
    );
}

SettingsView.propTypes = {
  onClose: PropTypes.func,
};