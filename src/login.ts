//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { ReplicantLite } from "@playpass/replicant-lite";

import { cloudStorage, internalStorage } from "./storage";
import { getStripeAccount, requireInit } from "./init";
import { clearSubscriptionCache, initSubscriptionCache } from "./purchase";

import "./ui/login-popup";

let replicantClient: ReplicantLite | undefined;
export { replicantClient };

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

    const telephoneInputParent = document.createElement("div");
    const telephoneInput = document.createElement("input");
    telephoneInput.id = "phone";
    telephoneInput.className = "phoneInput";
    telephoneInput.type = "tel";
    telephoneInput.autocomplete = "tel";
    telephoneInput.required = true;
    telephoneInputParent.appendChild(telephoneInput);
    (window as any).intlTelInput(telephoneInput, {});

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
            version: "1.1.0",
        },
        stripeAccountId: getStripeAccount(),
    });

    if (replicantClient.isLoggedIn()) {
        await onLogin();
    }
}
