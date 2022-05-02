# Template Configuration

Templates can be enriched and allow for no-code, content driven, themed games.

Any files in the `/config` directory of a template may be edited and referenced at runtime to change the behavior of the game.  Data in these files are static.

## Loading Configuration

Fetching the configuration depends on referencing the file name.

```javascript
await playpass.config.get("config.json");
```

Special handling exists for JSON files to automatically parse them as JS objects.  Other file types are returned as their raw text content.

Since fetching configuration files incurs network traffic, config file contents are cached in memory.  As such, it is recommended that large files or content whose data you do not need frequent access to should not be stored as part of a template's configuration.

## API reference

- [`playpass.config`](/api/interfaces/Configuration)
