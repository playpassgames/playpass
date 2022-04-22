//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { ReplicantLite } from "@playpass/replicant-lite";

import { LitElement, html, css } from "lit";
import { customElement, state, queryAssignedElements } from "lit/decorators.js";

@customElement("playpass-login")
export class LoginPopup extends LitElement {
    static override styles = css`
        :host {
            position: absolute;
            width: 307px;
            height: 232px;
            left: 50%;
            top: 50%;
            margin-left:-153px;
            margin-top:-116px;

            background: #FFFFFF;
            box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            border-radius: 10px;
            z-index: 0;

            user-select: none;

            font-family: 'Proxima Nova';
            font-style: normal;
            font-size: 1rem;
            line-height: 29px;
            text-align: center;
            
            color: #000000;
            --primary: #1095c1;
        }

        .overlay {
            position: relative;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);

            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadein 0.05s linear;
        }

        @keyframes fadein {
            from {
                background: transparent;
            }
            to {
                background: rgba(0,0,0,0.6);
            }
        }

        .popup {
            position: relative;

            background: #fff;
            padding: 1.5rem;
            border-radius: 0.5rem;
            text-align: center;

            box-shadow: rgba(0,0,0,0.3) 0 8px 24px;
            margin: 1rem;

            animation: popup-enter 0.2s ease-out;
        }

        @keyframes popup-enter {
            from {
                transform: translateY(-1.5rem);
            }
            to {
                transform: translateY(0);
            }
        }

        .spinner {
            display: inline-block;
            border-radius: 50%;

            width: 1em;
            height: 1em;
            padding: 0;
            margin: -8px 0;
            border: 5px solid rgba(0,0,0,0.1);
            border-bottom-color: #fff;
            animation: spinner-spin 1s infinite linear;
        }
        @keyframes spinner-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

        .close {
            cursor: pointer;
            position: absolute;
            top: 0;
            right: 0;
            color: #c0c0c0;
            font-size: 32px;
            padding: 10px;
            line-height: 20px;
        }
        .close:after {
            content: "\\00d7";
        }
        .close:hover {
            color: #999;
        }

        form {
            display: flex;
            flex-direction: column;
        }

        form * {
            padding: 0.5rem;
        }

        input {
            transition: box-shadow;
            outline: none;
            box-shadow: none;
            border: 1px solid #a2afb9;
            padding: 0.75rem 1rem;
            font-size: 1.25rem;
            border-radius: 0.25rem;
        }

        input:focus {
            box-shadow: 0 0 0 3px rgba(16, 149, 193, 0.125);
            border-color: var(--primary);
        }

        button {
            color: white;
            background: #2F79D0;
            font-size: 1rem;

            border: none;
            outline: none;
            cursor: pointer;
            text-align: center;
            border-radius: 4px;
            font-size: 14px;

            width: 130px;
            height: 43px;
            left: 50%;
            top: 50%;

            margin-left:65px;
            margin-top:0px;
        }

        a {
            color: var(--primary);
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }

        #code {
            text-align: center;
        }
        .error {
            color: red;
        }
    `;

    replicantClient!: ReplicantLite;

    onAbort?: () => void;
    onLogin?: () => void;

    @state() private loggedIn = false;
    @state() private phone?: string;
    @state() private error?: string;

    @state() private loading = false;

    private verifyOtp?: (code: string) => Promise<boolean>;

    @queryAssignedElements({ slot: "" }) private phoneElement!: Array<HTMLElement>;

    private onClose (event: Event) {
        event.preventDefault();
        this.remove();

        if (this.loggedIn) {
            if (this.onLogin) {
                this.onLogin();
            }
        } else if (this.onAbort) {
            this.onAbort();
        }
    }

    private async onSubmitPhone (event: SubmitEvent) {
        event.preventDefault();

        if (this.loading) {
            return; // Prevent double submits
        }
        this.loading = true;

        // input is embedded deep within
        const countryCode = (window as any).intlTelInputGlobals.getInstance(this.phoneElement[0].children[0].children[1]).s.dialCode as string;
        const phoneNumber = (this.phoneElement[0].children[0].children[1] as HTMLInputElement).value;

        const fullPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber : countryCode + phoneNumber;

        this.error = undefined;
        try {
            const { verifyOtp } = await this.replicantClient.login({
                consentText: "Enter phone number",
                phoneNumber: fullPhoneNumber,
            });
            this.verifyOtp = verifyOtp;
        } catch (error: unknown) {
            console.error(error);
            this.error = "Invalid phone number, try again";
            this.loading = false;
            return;
        }

        this.phone = phoneNumber;
        this.loading = false;
    }

    private async onInputCode (event: InputEvent) {
        this.error = undefined;

        const element = event.target as HTMLInputElement;
        const match = /\d{6}/.exec(element.value);
        if (match) {
            const code = match[0];

            const verifiedOk = await this.verifyOtp!(code);
            if (verifiedOk) {
                this.loggedIn = true;
            } else {
                this.error = "Invalid code";
            }
        }
    }

    private onTryAnotherPhone (event: Event) {
        event.preventDefault();
        this.error = undefined;
        this.phone = undefined;
    }

    override render () {
        let content;

        if (this.loggedIn) {
            content = html`<h2>Welcome</h2>
                <p>Success! You are now logged in.</p>
                <form @submit="${this.onClose}">
                    <button type="submit">Continue</button>
                </form>`;

        } else if (this.phone) {
            content = html`<h2>Confirm</h2>
                <p>We sent a code to ${this.phone}, enter it below.</p>
                <form>
                    <input id="code" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" @input="${this.onInputCode}" autofocus />
                    <span class="error">${this.error}</span>
                    <a @click="${this.onTryAnotherPhone}" href="#">← Use a different phone number</a>
                </form>`;

        } else {
            content = html`<h2>Login</h2>
                <p>Enter your phone number below to login.</p>
                <form @submit="${this.onSubmitPhone}">
                    <slot></slot>
                    <span class="error">${this.error}</span>
                    <button type="submit" ${this.loading ? "disabled" : ""}>
                        ${this.loading ? html`<span class="spinner"></span>` : "Send SMS"}
                    </button>
                </form>`;
        }

        return html`
            <div class="overlay">
                <div class="popup">
                    <div class="close" @click="${this.onClose}"></div>
                    ${content}
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "playpass-login": LoginPopup;
    }
}
