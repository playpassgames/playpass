// TODO(2022-04-19): Use a custom Web Component for this?
// https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
export class Keyboard extends EventTarget {
    constructor (element) {
        super();

        element.addEventListener("click", event => {
            if (event.target.childElementCount == 0) {
                const key = event.target.textContent;
                this.dispatchEvent(new CustomEvent("key", { detail: key }));
            }
        });

        window.addEventListener("keydown", event => {
            let key;
            switch (event.key) {
            case "Enter":
                key = "Enter";
                break;
            case "Backspace": case "Delete":
                key = "Delete";
                break;
            default:
                if (event.key.length == 1) {
                    const charCode = event.key.toUpperCase().charCodeAt(0);
                    if (charCode >= 65 && charCode <= 90) {
                        key = String.fromCharCode(charCode);
                    }
                }
            }
            if (key) {
                this.dispatchEvent(new CustomEvent("key", { detail: key }));
            }
        });
    }
}
