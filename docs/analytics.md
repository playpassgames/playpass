# Analytics

Analytics can be accessed on your game's dashboard. The dashboard includes basic stats such as:

- Daily active users (DAU)
- Virality and share rate
- Retention
- Uncaught JS errors

## Tracking custom events

Custom events can be tracked:

```javascript
playpass.analytics.track("MyEvent", { customData: 123 });
```

## Setting custom properties

Custom properties can be set on the current player:

```javascript
playpass.analytics.setProperty("bigSpender", true);
```
