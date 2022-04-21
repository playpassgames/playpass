# Store Player Data

The `playpass.storage` API can be used to store player data. The storage mechanism is more resilient
than `window.localStorage`, supports storing structured (JSON) data, and will sync across the
player's other devices.

## Saving data

Saving data is as simple as calling `playpass.storage.set()`:

```javascript
playpass.storage.set("health", 100);
```

Data can be in any format, such as a number, string, array, or deeply nested object.

## Loading data

```javascript
const health = await playpass.storage.get("health");
```

The storage API is asynchronous, so we use the `await` JavaScript keyword to wait until the data is
available.

## Persistent storage

If the player is [logged in](/account), storage will be persisted to their account in the cloud. If
they haven't logged in yet, the data will be stored locally until they create an account. The first
time a player creates an account in your game, their storage will be transferred to the cloud.

## API reference

- [`playpass.storage`](/api/interfaces/Storage)
