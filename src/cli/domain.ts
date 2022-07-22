//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import kleur from "kleur";
import * as readline from 'readline';
import {requireToken} from "./auth";
import PlaypassClient from "./playpass-client";
import * as path from "path";
import {loadConfig} from "./config";
import { exit } from "process";

const timeoutPromise = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readlineQuestionPromise = (question: string): Promise<string> => {
    return new Promise((resolve) => {
        const i = readline.createInterface({input: process.stdin, output: process.stdout});
        i.question(question, (answer) => {
          resolve(answer);
        });
    });
}

export async function domain(domain: string, opts: { game?: string }): Promise<void> {
    let gameId;
    if (opts.game) {
        gameId = opts.game;
    } else {
        const config = await loadConfig(path.join(process.cwd(), "playpass.toml"));
        gameId = config.game_id;
    }

    const token = await requireToken();
    const playpassClient = new PlaypassClient(token);

    const result = await playpassClient.customDomain(gameId, domain);

    if(result.customDomain.config.customDomainStatus === 'VALID') {
      console.log(`${kleur.green("✔")} Custom domain successfully created`);
      console.log(`Distribution URL: ${result.distributionDomainName} ${status}`);
      console.log(`Please create an alias record that points to ${result.distributionDomainName} in your DNS provider.`);
      return;
    }
    console.log(`Please create the following alias records`);
    console.log(`${kleur.cyan(domain)} => ${kleur.cyan(result.distributionDomainName!)}`);
    for(const record of result.recordsRequired) {
        console.log(`${kleur.cyan(record.alias)} => ${kleur.cyan(record.target)}`);
    }

    let answer 
    while(answer !== 'y'){
      answer = await readlineQuestionPromise(`Please confirm when you have created the records (${kleur.green('y')})`);
      answer = answer.toLowerCase().trim();
    }

    let validationStatus: string | undefined;

    console.log('Validation may take up to 5 minutes to complete');
    while(validationStatus !== 'VALID') {
      console.log('Waiting for validation...');
      await timeoutPromise(5000);
      const response = await playpassClient.validateCustomDomain(gameId);
      validationStatus = response.status;
    }
    console.log(`${kleur.green('✔')} Domain successfully validated. Visit ${kleur.cyan(`https://${domain}`)}.`);
    exit(0);
}
