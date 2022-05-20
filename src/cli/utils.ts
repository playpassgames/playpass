//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import fs from "fs/promises";
import os from "os";
import path from "path";
import { spawn as nodeSpawn } from "child_process";
import type { SpawnOptions } from "child_process";

export function slugify (text: string): string {
    return text
        .replace(/[^A-Za-z0-9]/g, "-") // Replace non-alpha with hyphens
        .replace(/-+/g, "-") // Reduce repeat runs of hyphens
        .replace(/(^-|-$)/g, "") // Trim leading and trailing hyphens
        .toLowerCase();
}

export function isError (error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error;
}

export function spawn (command: string, args: string[], opts: SpawnOptions): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = nodeSpawn(command, args, opts);
        child.on("error", reject);
        child.on("close", code => {
            if (code) {
                reject();
            } else {
                resolve();
            }
        });
    });
}

export function npm (args: string[], opts: SpawnOptions): Promise<void> {
    return spawn(/^win/.test(process.platform) ? "npm.cmd" : "npm", args, opts);
}

export async function exists (file: string): Promise<boolean> {
    try {
        await fs.stat(file);
        return true;
    } catch (error) {
        return false;
    }
}

// https://github.com/sindresorhus/env-paths
// Manually included here due to bundling issues
export function envPaths (name: string) {
    const homedir = os.homedir();
    const tmpdir = os.tmpdir();
    const {env} = process;

    if (process.platform === "darwin") {
        const library = path.join(homedir, "Library");

        return {
            data: path.join(library, "Application Support", name),
            config: path.join(library, "Preferences", name),
            cache: path.join(library, "Caches", name),
            log: path.join(library, "Logs", name),
            temp: path.join(tmpdir, name),
        };
    }

    if (process.platform === "win32") {
        const appData = env.APPDATA || path.join(homedir, "AppData", "Roaming");
        const localAppData = env.LOCALAPPDATA || path.join(homedir, "AppData", "Local");

        return {
            // Data/config/cache/log are invented by me as Windows isn't opinionated about this
            data: path.join(localAppData, name, "Data"),
            config: path.join(appData, name, "Config"),
            cache: path.join(localAppData, name, "Cache"),
            log: path.join(localAppData, name, "Log"),
            temp: path.join(tmpdir, name),
        };
    }

    const username = path.basename(homedir);

    return {
        data: path.join(env.XDG_DATA_HOME || path.join(homedir, ".local", "share"), name),
        config: path.join(env.XDG_CONFIG_HOME || path.join(homedir, ".config"), name),
        cache: path.join(env.XDG_CACHE_HOME || path.join(homedir, ".cache"), name),
        // https://wiki.debian.org/XDGBaseDirectorySpecification#state
        log: path.join(env.XDG_STATE_HOME || path.join(homedir, ".local", "state"), name),
        temp: path.join(tmpdir, username, name),
    };
}
