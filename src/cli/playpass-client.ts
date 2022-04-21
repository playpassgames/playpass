//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import axios, {AxiosResponse} from "axios";

const PLAYPASS_API_HOST = process.env.PLAYPASS_API_HOST || "https://creators-api.playpass.games";

export type Game = {
    id: number,
    name: string,
    config: {
        [key: string]: string
    }
}

export type CustomDomains = {
    id: string,
    customDomains: string[]
}

export type Deployment = {
    gameUrl: string;
    uploadUrl: string;
    distributionDomainName?: string | undefined;
}

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
            .then((a: AxiosResponse<{items: Game[]}>) => a.data.items);
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
            .then((a: AxiosResponse<Game>) => a.data);
    }

    public async upload(game: string, prefix?: string, customDomain?: string): Promise<Deployment> {
        return axios.request({
            method: "POST",
            url: `${this.host}/api/v1/games/${game}/upload`,
            headers: {
                "X-API-TOKEN": this.authToken
            },
            data: {
                prefix,
                customDomain
            },
        })
            .then((a: AxiosResponse<Deployment>) => a.data);
    }

    public async getCustomDomains(): Promise<CustomDomains[]> {
        return axios.request({
            method: "GET",
            url: `${this.host}/api/v1/custom-domains/`,
            headers: {
                "X-API-TOKEN": this.authToken
            }
        })
            .then((a: AxiosResponse<{ items: CustomDomains[] }>) => a.data.items);
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
            .then((a: AxiosResponse<{ id: string }>) => a.data);
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
}
