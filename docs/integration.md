# Integration

If you're integrating the SDK into an existing game, follow these steps.

## Installing

If your game uses a bundler like Webpack or Vite, you can install the SDK as a dependency using `npm
install --save playpass`, then import it:

```javascript
import * as playpass from "playpass";
```

If your game doesn't use a bundler, you can include the SDK as a script tag in your index.html:

```html
<script src="https://unpkg.com/playpass/dist/playpass.min.js"></script>
```

## Initializing

The only requirement to using the Playpass SDK is calling `playpass.init()`.

```javascript
// Initialize the Playpass SDK...
await playpass.init();

// Continue with the rest of your game's initialization...
```

Note that `playpass.init()` returns a Promise. We use the `await` JS keyword to wait until the Promise
resolves before continuing.
