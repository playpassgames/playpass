//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { ReplicantLite } from "@playpass/replicant-lite";

import { cloudStorage, internalStorage } from "./storage";
import { getStripeAccount, requireInit } from "./init";
import { clearSubscriptionCache, initSubscriptionCache } from "./purchase";

import "./ui/login-popup";

declare global {
    interface Window {
        intlTelInput?: (element: HTMLElement) => void;
    }
}

let replicantClient: ReplicantLite | undefined;
export { replicantClient };

let phoneCodeCss: HTMLLinkElement | undefined;
let phoneCodeScript: HTMLScriptElement | undefined; 

export function requireReplicantClient (funcName: string): ReplicantLite {
    requireInit(funcName);
    return replicantClient!;
}

// Keep track of the promise in order to support multiple simultaneous requests to login()
let pendingLogin: Promise<boolean> | undefined;

let loggedIn = false;

async function onLogin () {
    await Promise.all([
        cloudStorage.onLogin(replicantClient!),
        initSubscriptionCache(),
    ]);
    loggedIn = true;
}

function onLogout () {
    clearSubscriptionCache();
    loggedIn = false;
}

/**
 * Gets the ID of the player, which may be undefined if they haven't interacted with any Playpass
 * backend services yet.
 *
 * The player's ID may change after a call to {@link login}.
 */
export function getPlayerId (): string | undefined {
    return replicantClient?.getUserId();
}

export function isLoggedIn (): boolean {
    return loggedIn;
}

export async function login (): Promise<boolean> {
    requireInit("playpass.account.login");

    if (isLoggedIn()) {
        return true;
    }

    if (pendingLogin) {
        return pendingLogin; // Reuse a previous request to login()
    }

    // country code drop down elements for phone
    if (!phoneCodeCss) {
        phoneCodeCss = document.createElement("link");
        phoneCodeCss.rel = "stylesheet";
        phoneCodeCss.href = "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.css";
        document.head.appendChild(phoneCodeCss);
    }

    if (!phoneCodeScript) {
        phoneCodeScript = document.createElement("script");
        phoneCodeScript.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js");
        phoneCodeScript.setAttribute("crossorigin", "anonymous");
        document.head.appendChild(phoneCodeScript);

        // TODO(2022-06-22): Clean this up by moving styling to the login popup?
        const phoneInputStyle = document.createElement("style");
        phoneInputStyle.innerText = ".phoneInput { transition: box-shadow; outline: none; box-shadow: none; border: 1px solid #a2afb9; padding: 0.75rem 1rem; font-size: 1.25rem; border-radius: 0.25rem; } .phoneInput:focus { box-shadow: 0 0 0 3px rgba(16, 149, 193, 0.125); border-color: var(--primary); }";
        document.head.appendChild(phoneInputStyle);
    }

    const telephoneInputParent = document.createElement("div");
    const telephoneInput = document.createElement("input");
    telephoneInput.id = "phone";
    telephoneInput.className = "phoneInput";
    telephoneInput.type = "tel";
    telephoneInput.autocomplete = "tel";
    telephoneInput.required = true;
    telephoneInputParent.appendChild(telephoneInput);

    if (window.intlTelInput) {
        window.intlTelInput(telephoneInput);
    } else {
        phoneCodeScript.onload = () => {
            window.intlTelInput!(telephoneInput);
        };
    }

    const loginPopup = document.createElement("playpass-login");
    loginPopup.appendChild(telephoneInputParent);
    document.body.appendChild(loginPopup);

    pendingLogin = new Promise(resolve => {
        loginPopup.replicantClient = replicantClient!;

        loginPopup.onAbort = () => {
            resolve(false);
        };

        loginPopup.onLogin = async () => {
            await onLogin();
            resolve(true);
        };
    });

    const result = await pendingLogin;
    pendingLogin = undefined;
    return result;
}

export function logout () {
    requireInit("playpass.account.logout");

    replicantClient!.logout();
    onLogout();
}

export async function initLogin (gameId: string): Promise<void> {
    // Pull the credentials out of async storage
    const CREDS_KEY = "replicantCreds";
    let replicantCreds = await internalStorage.get(CREDS_KEY) as string;

    // Cover ourselves a bit with the storage override only supporting one key
    let lastUsedKey: string;
    function validateKey (name: string) {
        if (lastUsedKey && lastUsedKey != name) {
            throw new Error("Multiple storage keys not supported");
        }
        lastUsedKey = name;
    }

    replicantClient = await ReplicantLite.create({
        appName: gameId,

        replicant: {
            storageOverride: {
                length: 1,
                getItem (name) {
                    validateKey(name);
                    return replicantCreds;
                },
                setItem (name, value) {
                    validateKey(name);
                    replicantCreds = value;
                    internalStorage.set(CREDS_KEY, replicantCreds);
                },
                removeItem (name) {
                    validateKey(name);
                    internalStorage.remove(CREDS_KEY);
                },
                clear () {
                    throw new Error("Not implemented");
                },
                key () {
                    throw new Error("Not implemented");
                },
            },

            version: "1.4.1",
            // endpoint: "https://replicant-lite.us-east-1.replicant-playpass.gc-internal.net/replicant-lite-dev",
        },
        stripeAccountId: getStripeAccount(),
    });

    if (replicantClient.isLoggedIn()) {
        await onLogin();
    }
}
