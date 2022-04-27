# Integration

If you're integrating Playpass into an existing game, follow the steps below. Before you start, make
sure that you've [installed](/#1-install-playpass) the `playpass` CLI.

## Adding Playpass to an existing project

If your game uses a bundler like Webpack or Vite, you can run `playpass create` in your project
directory. You'll be prompted to add Playpass to your existing project.

If your game doesn't use a bundler, you can include the SDK as a script tag in your index.html:

```html
<script src="https://unpkg.com/playpass/dist/playpass.min.js"></script>
```

## Initializing Playpass

The only requirement to using the Playpass SDK is calling `playpass.init()`.

```javascript
import * as playpass from "playpass";

// Initialize the Playpass SDK...
await playpass.init({
    gameId: "<YOUR GAME ID HERE>"
});

// Continue with the rest of your game's initialization...
```

Note that `playpass.init()` returns a Promise. We use the `await` JS keyword to wait until the Promise
resolves before continuing.
