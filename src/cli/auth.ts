//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import fs from "fs/promises";
import path from "path";
import { envPaths, isError } from "./utils";
import open from "open";
import Koa from "koa";
import kleur from "kleur";

function authFile () {
    const dataDir = envPaths("playpass").data;
    return path.join(dataDir, "auth.json");
}

function startServer() {
    return new Promise((resolve, reject) => {
        const k = new Koa();

        const timeout = setTimeout(() => {
            reject(new Error("Login timeout, please try again"));
            server.close();
        }, 1000 * 60 * 5);

        k.use((ctx) => {
            const { api_key } = ctx.query;

            resolve(api_key);

            ctx.body = api_key;

            clearTimeout(timeout);
            server.close();
        });

        const server = k.listen(9765);

        open("https://playpass.games/login?cli=true");
    });
}

export async function login () {
    const file = authFile();
    await fs.mkdir(path.dirname(file), { recursive: true });

    const token = await startServer();

    await fs.writeFile(file, JSON.stringify({ token }));

    console.log(`${kleur.green("✔")} Logged in. Your $PLAYPASS_TOKEN for CI is ${token}`);
}

export async function logout () {
    try {
        await fs.unlink(authFile());
    } catch (error: unknown) {
        if (!isError(error) || error.code != "ENOENT") {
            throw error;
        }
    }
    console.log(`${kleur.green("✔")} Logged out.`);
}

export async function requireToken () {
    let token = process.env.PLAYPASS_TOKEN;
    if (!token) {
        try {
            token = JSON.parse(await fs.readFile(authFile(), "utf8")).token;
        } catch (error: unknown) {
            if (!isError(error) || error.code != "ENOENT") {
                throw error;
            }
        }
    }

    if (!token) {
        // TODO(2022-03-16): Automatically run playpass login?
        throw new Error("Run `playpass login` first or set the $PLAYPASS_TOKEN environment variable");
    }

    return token;
}
