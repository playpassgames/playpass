//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import axios, { AxiosResponse, AxiosError } from "axios";
import { playpassApiUrl } from "./config";

export type PlaypassResponse = {
    result?: boolean | undefined,
    error?: string | undefined
}

export type Game = {
    id: string,
    name: string,
    config: {
        [key: string]: string
    },
} & PlaypassResponse

export type Games = {
    items: Game[],
} & PlaypassResponse

export type CustomDomain = {
    customDomain: {
        id: string,
        domain: string,
        config: {
            certificateId: string;
            distributionId: string;
        }
    };
    distributionDeployed: boolean | undefined;
    distributionDomainName: string | undefined;
} & PlaypassResponse

export type Deployment = {
    gameUrl: string,
    uploadUrl: string,
    customDomain?: CustomDomain,
} & PlaypassResponse

export default class PlaypassClient {
    private authToken: string;
    private host: string;

    constructor(authToken: string, host: string = playpassApiUrl) {
        this.authToken = authToken;
        this.host = host;
    }

    public async checkGame(game: string): Promise<boolean> {
        return new Promise((resolve, reject) => axios.request({
            method: "HEAD",
            url: `${this.host}/api/v1/games/${game}`,
            headers: {
                "X-API-TOKEN": this.authToken
            },
        }).then(() => { resolve(true) })
            .catch(() => { resolve(false) }));
    }

    public async getGames(): Promise<Game[]> {
        return axios.request({
            method: "GET",
            url: `${this.host}/api/v1/games/`,
            headers: {
                "X-API-TOKEN": this.authToken
            }
        })
            .then((a: AxiosResponse<Games>) => {
                PlaypassClient.validateResponse(a, "Failed to retrieve games.");
                return a.data.items;
            });
    }

    public async create(game: string): Promise<Game> {
        return axios.request({
            method: "POST",
            url: `${this.host}/api/v1/games/`,
            headers: {
                "X-API-TOKEN": this.authToken
            },
            data: {
                name: game
            },
        })
            .then((a: AxiosResponse<Game>) => {
                PlaypassClient.validateResponse(a, "Failed to create game.");
                return a.data;
            });
    }

    public async upload(gameId: string, prefix?: string): Promise<Deployment> {
        return axios.request({
            method: "POST",
            url: `${this.host}/api/v1/games/${gameId}/upload`,
            headers: {
                "X-API-TOKEN": this.authToken
            },
            data: {
                prefix
            },
        })
            .then((a: AxiosResponse<Deployment>) => {
                PlaypassClient.validateResponse(a, "Failed to deploy game.");
                return a.data;
            });
    }

    public async getCustomDomain(gameId: string): Promise<CustomDomain> {
        return axios.request({
            method: "GET",
            url: `${this.host}/api/v1/games/${gameId}/custom-domain`,
            headers: {
                "X-API-TOKEN": this.authToken
            }
        })
            .then((a: AxiosResponse<CustomDomain>) => {
                PlaypassClient.validateResponse(a, "Failed to get custom domain.");
                return a.data;
            })
            .catch(reason => {
                if (axios.isAxiosError(reason)) {
                    const error = reason as AxiosError;
                    if (error.response?.status === 404) {
                        throw new Error("This game does not have a custom domain configured.");
                    }
                } else {
                    return reason;
                }
            });
    }

    public async customDomain(gameId: string, customDomain: string, certificate: string, privateKey: string, certificateChain?: string) {
        return axios.request({
            method: "POST",
            url: `${this.host}/api/v1/games/${gameId}/custom-domain`,
            headers: {
                "X-API-TOKEN": this.authToken
            },
            data: {
                customDomain,
                certificate,
                privateKey,
                certificateChain
            }
        })
            .then((a: AxiosResponse<CustomDomain>) => {
                PlaypassClient.validateResponse(a, "Failed to create custom domain.");
                return a.data;
            });
    }

    public async deleteDomain(gameId: string) {
        return axios.request({
            method: "DELETE",
            url: `${this.host}/api/v1/games/${gameId}/custom-domain`,
            headers: {
                "X-API-TOKEN": this.authToken
            }
        });
    }

    private static validateResponse(a: AxiosResponse<{
        result?: boolean | undefined,
        error?: string | undefined
    }>, fallbackMessage: string) {
        if (a.data.result !== undefined && !a.data.result) {
            if (a.data.error) {
                throw new Error(a.data.error);
            } else {
                throw new Error(fallbackMessage);
            }
        }
    }
}
