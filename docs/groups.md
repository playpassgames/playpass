# Groups

Groups enable server-less multiplayer by providing a shared storage area. Multiple players can
access a group's storage at the same time.

## Creating a new group

```javascript
const group = playpass.createGroup();
```

## Sending a group to a friend

Once you have a group, you need to send the group's ID to another player so that they can access it.
One way to do this is by embedding it into a link with `playpass.createLink()` and sharing it with
`playpass.share()`.

```javascript
// Create a link
const link = playpass.createLink({ data: { myGroupId: group.groupId } });

// Share the link
playpass.share({ text: `Come play in my group! ${link}` });
```

## Joining an existing group

From the above example, we can check if the player launched the game by clicking on the group link:

```javascript
const data = playpass.getLinkData();
if (data && data.myGroupId) {
    const group = playpass.getGroup(data.myGroupId);
    // We can now access the group!
}
```

## Writing custom data to the group

```javascript
group.storage.set("title", "My Awesome Group");
```

## Reading custom data from the group

```javascript
const title = await group.storage.get("title");
```

## Player-specific data

To store data relevant to an individual player, the best practice is to prefix the storage key with
the player's ID:

```javascript
group.storage.set(`${playpass.getPlayerId()}_score`, 123);
```

A list of players that have ever written to the group can be queried using `getPlayers()`:

```javascript
for (const playerId of await group.getPlayers()) {
    const score = await group.storage.get(`${playerId}_score`);
    console.log(`Player ${playerId}'s score is ${score}!`);
}
```
