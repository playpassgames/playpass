//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { program } from "commander";
import kleur from "kleur";

import { login, logout } from "./auth";
import { create } from "./create";
import { deploy } from "./deploy";
import { domain } from "./domain";
import { getDomain } from "./get-domain";
import { deleteDomain } from "./delete-domain";

if (!process.env.PLAYPASS_DEV) {
    process.on("uncaughtException", (error) => {
        console.error(`${kleur.red("✘")} ${error.message || error}`);
        process.exit(1);
    });
}

program
    .command("login")
    .description("Login to Playpass")
    .action(login);

program
    .command("logout")
    .description("Logout of Playpass")
    .action(logout);

program
    .command("create [directory]")
    .option("--template <template>", "New project template")
    .description("Create a new game project")
    .action(create);

program
    .command("deploy")
    .option("--prefix <prefix>", "Prefix to prepend to the subdomain URL")
    .option("--customDomain <customDomain>", "Custom domain ID to be configured")
    .description("Deploy a built game")
    .action(deploy);

program
    .command("get-domain")
    .option("--game <gameId>", "Id of the custom domain's game")
    .action(getDomain);

program
    .command("delete-domain")
    .option("--game <gameId>", "Id of the custom domain's game")
    .action(deleteDomain);

program
    .command("create-domain")
    .argument("<domain", "Custom domain")
    .requiredOption("--certificate <certificatePath>", "Path to the PEM-encoded certificate")
    .requiredOption("--privateKey <privateKeyPath>", "Path to the PEM-encoded certificate private key")
    .option("--certificateChain <certificateChainPath>", "Path to the PEM-encoded full certificate chain")
    .option("--game <gameId>", "Id of the custom domain's game")
    .action(domain);

program
    .name("playpass")
    .version(require("../../../package.json").version) // eslint-disable-line @typescript-eslint/no-var-requires
    .description(
        "Playpass SDK.\n\nLearn more at https://playpass.games",
    )
    .parse();
