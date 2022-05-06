//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { ReplicantLite } from "@playpass/replicant-lite";

import { html, css, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import type { SVGTemplateResult } from "lit";

import { popupCss, Popup } from "./popup";

type ShareType = "facebook" | "twitter" | "whatsapp" | "telegram" | "clipboard";

type ShareIcon = {
    type: ShareType;
    path: SVGTemplateResult;
    color: string;
}

const icons: ShareIcon[] = [
    {
        type: "facebook",
        path: svg`<path d="M24 12a12 12 0 10-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.6-4.7l2.6.2v3h-1.5c-1.5 0-2 .9-2 1.8V12h3.4l-.5 3.5h-2.8v8.4A12 12 0 0024 12z" />`,
        color: "#0076FB",
    },
    {
        type: "twitter",
        path: svg`<path d="M24 4.6a10 10 0 01-2.9.7 5 5 0 002.2-2.7c-1 .6-2 1-3.1 1.2a5 5 0 00-8.4 4.5A14 14 0 011.6 3.2 4.8 4.8 0 001 5.6a5 5 0 002.2 4.1 4.9 4.9 0 01-2.3-.6A5 5 0 005 14a5 5 0 01-2.2 0 5 5 0 004.6 3.5 9.9 9.9 0 01-6.1 2.1H0a14 14 0 007.6 2.2c9 0 14-7.5 14-14V7A10 10 0 0024 4.6z" />`,
        color: "#1DA1F2",
    },
    {
        type: "whatsapp",
        path: svg`<path d="M17.5 14.4l-2-1c-.3 0-.5-.1-.7.2l-1 1.1c-.1.2-.3.3-.6.1s-1.3-.5-2.4-1.5a9 9 0 01-1.7-2c-.1-.3 0-.5.2-.6l.4-.6c.2-.1.2-.3.3-.5v-.5L9 7c-.2-.6-.4-.5-.6-.5h-.6c-.2 0-.5 0-.8.4-.2.3-1 1-1 2.5s1 2.8 1.2 3c.2.2 2.1 3.2 5.1 4.5l1.7.6a4 4 0 001.9.2c.5-.1 1.7-.8 2-1.5.2-.6.2-1.2.1-1.4l-.5-.3M12 21.8a9.9 9.9 0 01-5-1.4l-.4-.2-3.7 1 1-3.7-.2-.3a9.9 9.9 0 01-1.5-5.3 9.9 9.9 0 0116.8-7 9.8 9.8 0 013 7 9.9 9.9 0 01-10 9.9m8.4-18.3A11.8 11.8 0 0012.1 0 12 12 0 001.8 17.8L0 24l6.4-1.6a11.9 11.9 0 005.6 1.4 12 12 0 0012-11.9 11.8 11.8 0 00-3.5-8.4z" />`,
        color: "#25D366",
    },
    {
        type: "telegram",
        path: svg`<path d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56-.72 0-.6-.27-.84-.95L6.3 13.7.85 12c-1.18-.35-1.19-1.16.26-1.75l21.26-8.2c.97-.43 1.9.24 1.53 1.73z" />`,
        color: "#0088CC",
    },
    {
        type: "clipboard",
        path: svg`<path d="M16 1H4a2 2 0 00-2 2v14h2V3h12V1zm3 4H8a2 2 0 00-2 2v14c0 1.1.9 2 2 2h11a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h11v14z" />`,
        color: "#718096",
    },
];

@customElement("playpass-share")
export class SharePopup extends Popup {
    static override styles = [
        popupCss,
        css`
            button {
                font-size: 0;
                width: 4rem;
                padding: 0.5rem;
            }

            .preview {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 24rem;
                font-style: italic;
                color: #666;
            }
        `
    ];

    @property() shareText = "";

    onShare?: (type: ShareType | null) => void;

    override onClose (event: Event) {
        super.onClose(event);
        if (this.onShare) {
            this.onShare(null);
        }
    }

    protected onShareClick (event: Event) {
        if (this.onShare && event.currentTarget instanceof HTMLButtonElement) {
            const type = event.currentTarget.name as ShareType;
            this.onShare(type as ShareType);
        }
        this.remove();
    }

    override renderPopup () {
        return html`
            <p class="preview">
                ${this.shareText}
            </p>
            ${map(icons, icon => html`
                <button style="background: ${icon.color}" name="${icon.type}" @click="${this.onShareClick}">
                    <svg fill="white" viewBox="0 0 24 24">
                        ${icon.path}
                    </svg>
                </button>`)}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "playpass-share": SharePopup;
    }
}
