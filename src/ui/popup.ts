//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { LitElement, html, css } from "lit";

export class Popup extends LitElement {
    static override styles = css`
        :host {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 0;
            width: 100%;
            height: 100%;

            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Helvetica, sans-serif;
            user-select: none;

            color: #415462;

            --primary: #1095c1;
            font-size: 18px;
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
            background: var(--primary);
            padding: 0.75rem 1rem;
            font-size: 1rem;

            border: none;
            outline: none;
            cursor: pointer;
            text-align: center;
            border-radius: 0.25rem;
            font-size: 1.25rem;
        }

        a {
            color: var(--primary);
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }

        .error {
            color: red;
        }
    `;

    protected onClose (event: Event) {
        event.preventDefault();
        this.remove();
    }

    protected renderPopup () {
        return html`<p>Hello world</p>`;
    }

    override render () {
        return html`
            <div class="overlay">
                <div class="popup">
                    <div class="close" @click="${this.onClose}"></div>
                    ${this.renderPopup()}
                </div>
            </div>
        `;
    }
}
