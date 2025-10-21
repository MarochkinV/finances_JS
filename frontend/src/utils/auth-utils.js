import { HttpUtils } from "./http-utils";

export class AuthUtils {
    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoTokenKey = 'userInfo';

    static refreshPromise = null;
    static setAuthInfo(accessToken, refreshToken, userInfo = null) {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        if (userInfo) {
            localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
        }
    }
    static removeAuthInfo() {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoTokenKey);
    }
    static getAuthInfo(key = null) {
        if (key && [this.accessTokenKey, this.refreshTokenKey, this.userInfoTokenKey].includes(key)) {
            return localStorage.getItem(key);
        } else {
            return {
                [this.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
                [this.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
                [this.userInfoTokenKey]: localStorage.getItem(this.userInfoTokenKey),
            };
        }
    }
    static async updateRefreshToken() {

        if (this.refreshPromise) {
            return await this.refreshPromise;
        }

        const refreshToken = this.getAuthInfo(this.refreshTokenKey);

        if (!refreshToken) {
            this.removeAuthInfo();
            return false;
        }
        
        //Создаем промис для обновления токенов
        this.refreshPromise = this._performTokenRefresh(refreshToken);
        
        try {
            const result = await this.refreshPromise;
            return result;
        } finally {

            this.refreshPromise = null;
        }
    }

    static async _performTokenRefresh(refreshToken) {
        const result = await HttpUtils.request('/refresh', 'POST', false, {
            refreshToken: refreshToken,
            rememberMe: false // Добавляем rememberMe параметр, который ожидает backend
        });

        if (
            result.error ||
            !result.response?.tokens?.accessToken ||
            !result.response?.tokens?.refreshToken
        ) {
            this.removeAuthInfo();
            return false;
        }

        //Обновляем токены
        this.setAuthInfo(
            result.response.tokens.accessToken,
            result.response.tokens.refreshToken
        );
        return true;
    }
}