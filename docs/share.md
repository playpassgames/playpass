# Add a Share Button

Help your game go viral by enabling users to share links to your game.

```javascript
document.getElementById("yourButton").onclick = function () {
    const link = playpass.createLink();
    playpass.share({
        text: "I scored 742 points! " + link,
    });
};
```

(**Coming Soon**) Links created with `playpass.createLink()` will contain tracking parameters, allowing you to see how
viral your game is in your account dashboard.

## Embedding custom link data

You can embed custom game data into your link by passing it to `playpass.createLink()`. Custom link
data can be used to implement multiplayer features like gifts or challenges.

For example, to allow players to share gifts of coins to eachother:

```javascript
const link = playpass.createLink({
    data: { coins: 123 },
});

playpass.share({
    text: "Here's a coin gift for you: " + link,
});
```

To receive the custom data, check it in your game's initialization with `playpass.getLinkData()`:

```javascript
const data = playpass.getLinkData();
if (data) {
    console.log("Opened a link with coins!", data.coins);
}
```

## Sharing to the best place

You can determine where will be the best social media platform or app to share your links to with `playpass.device.getBestShareType()`.
This functionality depends on Referrer data, which allows playpass to determine which social media platform users are coming from and can allow you to post new share links on that same platform.  This is useful for boosting your game and community in a particular space.

For example, if a player was referred by a link on twitter, we can make sure your share button posts back on twitter.

```javascript
const shareType = playpass.device.getBestShareType();

document.getElementById("yourButton").onclick = function () {
    const link = playpass.createLink();
    playpass.share({
        text: "I scored 742 points! " + link,
        type: shareType,
    });
};
```

## API reference

- [`playpass.share()`](/api/#share)
- [`playpass.createLink()`](/api/#createlink)
- [`playpass.getLinkData()`](/api/#getlinkdata)
- [`playpass.device.getBestShareType()`](/api/modules/device/#getBestShareType)
