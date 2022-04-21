# Feature Flags

Feature flags are a way to incrementally rollout new features and measure the impact of your changes
using analytics.

## Defining feature flags

```javascript
playpass.createFeatureFlag('ezMode');

if (playpass.featureFlagIsEnabled('ezMode')) {
    console.log('ezMode feature flag was initialized to true');
} else {
    console.log('ezMode feature flag was initialized to false');
}
```

By default, only 50% of your players will receive the feature. You can specify the percentage
rollout by passing options to `createFeatureFlag()`:

```javascript
playpass.createFeatureFlag('ezMode', {
    percent: 5, // only 5% rollout
});
```

The `percent` parameter can be increased over time during development to incrementally rollout your
feature to more players.

You can also filter your feature rollout to specific types of players using the `filter` parameter:

```javascript
// Rollout to 90% of players that have a high score above 250
await playpass.createFeatureFlag('ezMode', {
    percent: 90,
    filter: async function () {
        return await playpass.storage.get('highScore') > 250;
    },
});

// Rollout to 50% of players that have a color preference of red;
await playpass.createFeatureFlag('ezMode', {
    filter: async function () {
        return await playpass.storage.get('colorPref') === 'red';
    },
});
```

## Checking feature flags

```javascript
if (playpass.featureFlagIsEnabled('ezMode')) {
    // The feature is enabled
} else {
    // The feature is disabled
}
```

Note that `featureFlagIsEnabled` will throw an error if called before `playpass.init()` has resolved.

## Enabling/disabling programmatically

Feature flags are enabled automatically, but you can also enable/disable them manually if necessary:

```javascript
if (specialConditionReached()) {
    playpass.setFeatureFlagEnabled('ezMode', true); // enables ezMode feature flag
}

if (differentSpecialConditionReached()) {
    playpass.setFeatureFlagEnabled('ezMode', false); // disabled ezMode feature flag
}
```

Note that `setFeatureFlagEnabled` will throw an error if either called before `playpass.init()` has resolved or if the feature flag to be modified has not yet been created.

## Enabling using a link

During development, you can force specific feature flags to be on or off by loading your game with a
link.  This will make `createFeatureFlag` calls of the same feature flag name obsolete.

For example, `https://localhost:8000/#{"featureFlags":{"ezMode":true}}` will force enable the
`ezMode` feature flag.

## Measuring

Feature flags are tracked in analytics, allowing you to segment players who have your feature
enabled vs disabled.
