# Sending Push Notifications

Push notifications use Web Push to schedule notifications for your players, even when the game isn't
running.

**Important**: Push notifications require first [setting up a PWA and service
worker](/home-screen/#pwa-checklist).

## Checking permission state

Call [`getPermissionState()`](/api/modules/notifications/#getpermissionstate) to determine whether
we can ask for notification permission.

```js
const state = await playpass.notifications.getPermissionState();
if (state == "prompt") {
    // Show an upsell to enable notifications for an in-game reward
}
```

## Requesting notification permission

Call [`requestPermission()`](/api/modules/notifications/#requestpermission) to show the built-in browser UI for requesting push notification
permissions.

```js
const granted = await playpass.notifications.requestPermission();
if (granted) {
    // Player granted permission, give them a reward for installing
}
```

## Scheduling a notification

Call [`schedule()`](/api/modules/notifications/#schedule) to schedule a push notification for future
delivery.

```js
playpass.notifications.shedule("reminder", {
    delay: 24*60*60*1000,
    title: "It's been 24 hours, remember to play Borble 😃",
});
```

Notifications can be scheduled even before permission has been granted, but they won't actually be
delivered until permission is granted.

See [`ScheduleOptions`](/api/modules/notifications/#scheduleoptions) for a full list of options for
controlling notification display and delivery.

## API reference

- [`playpass.notifications`](/api/modules/notifications)
