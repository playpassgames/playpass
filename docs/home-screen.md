# Installing to Home Screen

[Add to Home
screen](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen) is a
browser feature that allows installing a shortcut to the user's Home screen.

## PWA checklist

First we need to follow a few steps to configure PWA support:

1. Create a new `public/app.webmanifest` file:

    ```json
    {
        "background_color": "#000000",
        "display": "standalone",
        "icons": [
            {
                "src": "logo-192x192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any maskable"
            }
        ],
        "name": "Your Game",
        "start_url": "/"
    }
    ```

2. Create a 192x192 pixel icon in `public/logo-192x192.png`.

3. Link to the manifest in your `index.html`:

    ```html
    <!doctype html>
    <html>
    <head>
        <link rel="manifest" href="app.webmanifest">
    </head>
    </html>
    ```

4. Create a new `src/service-worker.ts` that will be the entry point for your service worker:

    ```js
    import { init } from "playpass/dist/esm/serviceWorker";
    
    init();
    ```
    
5. Configure your build script to also build `dist/service-worker.js` whenever you `npm run build`. For example:

    ```json
    {
        "scripts": {
            "build": "vite build && esbuild src/service-worker.ts --bundle --minify --outfile=dist/service-worker.js"
        }
    }
    ```
    
6. In your game where you call `playpass.init()`, pass along the service worker URL:

    ```js
    await playpass.init({
        gameId: "your-game-id",
        serviceWorker: "./service-worker.js",
    });
    ```

## Checking if the player can install

Not all browsers support PWA installation. Other browsers require the user to spend some time
interacting with the page before it can become installable. Use
[`getInstallState()`](/api/modules/device/#getinstallstate) to check current availability.

```js
if (playpass.device.getInstallState() == "installable") {
    // Show an offer to install for an in-game reward
}
```

## Requesting to install

Call [`requestInstall()`](/api/modules/device#requestinstall) to show the built-in browser UI for installing the PWA.

```js
const installed = await playpass.device.requestInstall();
if (installed) {
    // Player installed, give them a reward for installing
}
```

## API reference

- [`playpass.device.getInstallState()`](/api/modules/device#getinstallstate)
- [`playpass.device.requestInstall()`](/api/modules/device#requestinstall)
