//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import axios, {AxiosResponse} from "axios";

const PLAYPASS_API_HOST = process.env.PLAYPASS_API_HOST || "https://creators-api.playpass.games";

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

export type CustomDomains = {
    items: CustomDomain[],
} & PlaypassResponse

export type CustomDomain = {
    id: string,
    customDomains: string[],
} & PlaypassResponse

export type Deployment = {
    gameUrl: string,
    uploadUrl: string,
    distributionDomainName?: string | undefined,
} & PlaypassResponse

export default class PlaypassClient {
    private authToken: string;
    private host: string;

    constructor(authToken: string, host: string = PLAYPASS_API_HOST) {
        this.authToken = authToken;
        this.host = host;
    }

    public async checkGame(game: string): Promise<void> {
        return axios.request({
            method: "HEAD",
            url: `${this.host}/api/v1/games/${game}`,
            headers: {
                "X-API-TOKEN": this.authToken
            },
        })
            .then(() => {
                return;
            });
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

    public async upload(gameId: string, prefix?: string, customDomain?: string): Promise<Deployment> {
        return axios.request({
            method: "POST",
            url: `${this.host}/api/v1/games/${gameId}/upload`,
            headers: {
                "X-API-TOKEN": this.authToken
            },
            data: {
                prefix,
                customDomain
            },
        })
            .then((a: AxiosResponse<Deployment>) => {
                PlaypassClient.validateResponse(a, "Failed to deploy game.");
                return a.data;
            });
    }

    public async getCustomDomains(): Promise<CustomDomain[]> {
        return axios.request({
            method: "GET",
            url: `${this.host}/api/v1/custom-domains/`,
            headers: {
                "X-API-TOKEN": this.authToken
            }
        })
            .then((a: AxiosResponse<CustomDomains>) => {
                PlaypassClient.validateResponse(a, "Failed to get custom domains.");
                return a.data.items;
            });
    }

    public async customDomain(customDomains: string[], certificate: string, privateKey: string, certificateChain?: string) {
        return axios.request({
            method: "POST",
            url: `${this.host}/api/v1/custom-domains/`,
            headers: {
                "X-API-TOKEN": this.authToken
            },
            data: {
                customDomains,
                certificate,
                privateKey,
                certificateChain
            }
        })
            .then((a: AxiosResponse<{ id: string, result?: boolean | undefined, error?: string | undefined }>) => {
                PlaypassClient.validateResponse(a, "Failed to create custom domain.");
                return a.data;
            });
    }

    public async deleteDomain(domainId: string) {
        return axios.request({
            method: "DELETE",
            url: `${this.host}/api/v1/custom-domains/${domainId}`,
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
