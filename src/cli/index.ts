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
import { playpassUrl } from "./config";
import {deleteGame} from "./delete";
import {rename} from "./rename";

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
    .option("--name <subdomain>", "Canonical name of your project.  This will be used as your subdomain.  Defaults to the directory name.")
    .option("--template <template>", "New project template.  Accepts git urls via degit")
    .option("-l, --local", "initializes the project locally without reserving a game id")
    .description("Create a new game project")
    .action(create);

program
    .command("deploy")
    .option("--prefix <prefix>", "Prefix to prepend to the subdomain URL")
    .option("--customDomain <customDomain>", "Custom domain ID to be configured")
    .option("--noBuild", "Skip building the project before deploying")
    .description("Deploy a built game")
    .action(deploy);

program
    .command("rename [name]")
    .option("-y, --yes", "Skip confirmation")
    .description("Rename your game")
    .action(rename);

program
    .command("delete")
    .option("-y, --yes", "Skip confirmation")
    .description("Delete a game and all of its deployed assets")
    .action(deleteGame);

const customDomain = program.command("custom-domain");

customDomain
    .command("get")
    .option("--game <game>", "Id of the custom domain's game")
    .action(getDomain);

customDomain
    .command("delete")
    .option("--game <game>", "Id of the custom domain's game")
    .action(deleteDomain);

customDomain
    .command("create")
    .argument("<domain", "Custom domain")
    .requiredOption("--certificate <certificatePath>", "Path to the PEM-encoded certificate")
    .requiredOption("--privateKey <privateKeyPath>", "Path to the PEM-encoded certificate private key")
    .option("--certificateChain <certificateChainPath>", "Path to the PEM-encoded full certificate chain")
    .option("--game <game>", "Id of the custom domain's game")
    .action(domain);

program
    .name("playpass")
    .version(require("../../../package.json").version) // eslint-disable-line @typescript-eslint/no-var-requires
    .description(
        `Playpass SDK.\n\nLearn more at ${playpassUrl}`,
    )
    .parse();
