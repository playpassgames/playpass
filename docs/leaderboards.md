# Leaderboards

Leaderboards encourage competition by showing your top players ranked by score.

## Getting a leaderboard

Use `getLeaderboard` to get a [`Leaderboard`](/api/interfaces/leaderboard.Leaderboard) instance. Your
game can have any number of named leaderboards.

```javascript
const leaderboard = playpass.leaderboards.getLeaderboard("MyAwesomeLeaderboard");
```

## Submitting a score

To submit a score for the player, call `submitScore`.

```javascript
leaderboard.submitScore(123);
```

If this player already submitted a score, the old score will be replaced if the new score is higher.
If your leaderboard is inverted so that lower scores are considered better (like scores in golf, or
times in racing), set `lowerIsBetter` to true:

```javascript
leaderboard.submitScore(123, { lowerIsBetter: true });
```

## Displaying top scores

`listScores()` returns a Promise for an array of
[`LeaderboardRecord`](/api/interfaces/leaderboards.LeaderboardRecord) objects. Use the `await` JS
keyword to wait for the Promise to resolve:

```javascript
const records = await leaderboard.listScores();
for (const record of records) {
    console.log(`Rank ${record.rank} is ${record.profileData?.name || "Anonymous"}`);
}
```

The records will be sorted by ranking, with higher scores being better. As with `submitScore`, if
your leaderboard scoring is inverted you can set `lowerIsBetter` to change the sort order:

```javascript
const records = await leaderboard.listScores({ lowerIsBetter: true });
```

## Setting the player's leaderboard profile data

Before we can display our leaderboard, we need to identify our players by attaching some custom data
to their leaderboard profile.

```javascript
playpass.leaderboards.setProfileData({ name: "Mario" });
```

The profile is an object that can contain arbitrary data. In the above examples, it contains only a
name, but it can also include other custom data to jazz up your leaderboard.

It's up to developers to prompt the player for their name or other profile data. We recommend
letting your players play anonymously, and only asking them for their name later in your game's
experience.

## Fetching the current player's record

Use `getRecords` to retrieve the records for a list of any particular player IDs:

```javascript
const records = await leaderboard.getRecords([ playpass.account.getPlayerId() ]);
```

## Implementing private leaderboards

### Sending an invite

To create a private friends-only leaderboard, you can generate a random leaderboard name and send it
to other players in a shared link.

```javascript
const leaderboard = playpass.leaderboards.getLeaderboard("MyPrivateLeaderboard_" + Math.random());

// Create a link embedded with the name of the leaderboard
const link = playpass.createLink({ data: { leaderboardName: leaderboard.name } });

// Share the link
playpass.share({ text: "Come join my leaderboard! " + link });
```

### Joining from an invite link

Use `getLinkData()` in your initialization to check if the game was launched from our invite link:

```javascript
const data = playpass.getLinkData();
if (data && data.leaderboardName) {
    const leaderboard = playpass.leaderboards.getLeaderboard(data.leaderboardName);
    // We now have access to the leaderboard and can submit a score to it!
}
```

## Implementing daily/weekly/monthly leaderboards

For time or level-based leaderboards, we recommend cycling your leaderboard names. For example, you
can append the current day number or level seed to the name of the leaderboard.

## API reference

- [`playpass.leaderboards.getLeaderboard()`](/api/modules/leaderboards/#getleaderboard)
- [`playpass.leaderboards.setProfileData()`](/api/modules/leaderboards/#setprofiledata)
