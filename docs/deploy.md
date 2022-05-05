# Deploy Your Game

Games are hosted on our high-performance CDN. All games have a `*.playpass.games` subdomain, and you can also use your own domain.

## Deploying

This command will deploy your game to `https://yourgame.playpass.games`:

```shell
playpass deploy
```

## Branch previews

Use the `--prefix` parameter to create an alternate subdomain:

```shell
playpass deploy --prefix mytest
```

This will deploy the game to `https://mytest--yourgame.playpass.games`. This can be used to deploy
branches to QA for testing.

## Custom domains

A custom domain name (`yourgame.com`) can be setup with the CLI. You can then set the domain when
deploying your game. The final step is to create a DNS alias entry in your provider pointing to the
url returned to you.

### CLI

Use the `create-domain` command first:

```shell
playpass create-domain <domain> --certificate <certificatePath> --privateKey <privateKeyPath> [--certificateChain <certificateChainPath>]
```

You can also create it outside of your game's directory with the `gameId` flag:

```shell
playpass create-domain <domain> --certificate <certificatePath> --privateKey <privateKeyPath> [--certificateChain <certificateChainPath> --gameId <gameId>]
```

To set up a custom domain with the CLI you need to provide the domain (e.g. `foo.example.com`) and its respective PEM encoded SSL certificate and private key.
After the domain is created the CLI will print your custom domain's distribution URL on your terminal, use it to configure an alias record in your DNS provider.
You can always run `playpass get-domain` to see your game's custom domain.

You can delete the custom domain with `playpass delete-domain`.

### Certificates

If you do not have a certificate for your domain yet, you can easily create one with [certbot](https://certbot.eff.org/).
Follow the installation instructions on their website to install and create a certificate for your domain.
You can alternatively configure it manually with the following command:

```shell
sudo certbot certonly --manual --preferred-challenges dns -d "dailypoker.gg"
```

The certificate, private key and chain should now be at `/etc/letsencript/live/example.com/`.
