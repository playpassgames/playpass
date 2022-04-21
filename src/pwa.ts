//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

export function getPWADisplayMode() {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (document.referrer.startsWith("android-app://")) {
        return "pwa";
    } else if ((navigator as { standalone?: boolean }).standalone || isStandalone) {
        return "standalone";
    }
    return "browser";
}
