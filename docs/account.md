# Add a Login Button

Playpass takes care of all the hard parts of account creation and authentication. All you need to do
is call `playpass.account.login()`:

```javascript
document.getElementById("yourButton").onclick = function () {
    const success = await playpass.account.login();
    if (success) {
        alert("Thanks for logging in!");
    }
};
```

When you call `login()`, the player will be shown a popup prompting their phone number to receive an
SMS login code. After they confirm, an account will be created for them and their `playpass.storage`
data is moved into the cloud. For returning players logging in on a new device, their
`playpass.storage` will be restored from the cloud.

## API reference

- [`playpass.account.login()`](/api/modules/account/#login)
- [`playpass.account.isLoggedIn()`](/api/modules/account/#isloggedin)
- [`playpass.account.logout()`](/api/modules/account/#logout)
