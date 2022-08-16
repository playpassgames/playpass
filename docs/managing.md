# Managing Your Game

## Renaming

If you are unhappy with the name you chose for your game you can always rename it with the following command:

```shell
playpass rename
```

> **Please keep in mind all of your existing deployments will be lost.** You will have to redeploy your game afterwards.

A confirmation prompt will pop up and another to select your game's new name. Your custom domain will also be updated to
reflect this change if you have one.

> **Note:** You will lose ownership of your game's old name.

## Deleting

If you need to delete your game you can use:

```shell
playpass delete
```

This will delete your game, including all deployments and custom domains.

> **Note:** You will lose ownership of your game's name.

## Inviting Owners

If you'd like to have others assist you with owning and managing your game, you can invite them to your project using the CLI.

You currently need to know the user's ID in order to add them to your team.

```shell
playpass invite <userId>
```

Once a user has ownership, they will be able to deploy new builds and make changes to the game's identity, content, or even DELETE it, just like you can.

> **Note:** Once someone is added as an owner of your game, they can also invite users other users to own the game.  Only grant ownership to users you trust.
