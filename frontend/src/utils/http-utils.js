import config from "../config/config";
import { AuthUtils } from "./auth-utils";

export class HttpUtils {

    static async request(url, method = "GET", useAuth = true, body = null) {
        const result = {
            error: false,
            response: null,
            redirect: null
        };

        const params = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        };

        if (useAuth) {
            const accessToken = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
            const refreshToken = AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey);
            

            if (!accessToken) {
                if (!refreshToken) {
                    result.error = true;
                    result.redirect = "/login";
                    return result;
                } else {
                    const updated = await AuthUtils.updateRefreshToken();
                    if (!updated) {
                        result.error = true;
                        result.redirect = "/login";
                        return result;
                    }
                    const newAccessToken = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
                    if (newAccessToken) {
                        params.headers['x-auth-token'] = newAccessToken;
                    } else {
                        result.error = true;
                        result.redirect = "/login";
                        return result;
                    }
                }
            } else {
                params.headers['x-auth-token'] = accessToken;
            }
        }

        if (body) {
            params.body = JSON.stringify(body);
        }

        let response = null;
        try {
            response = await fetch(config.api + url, params);
            result.response = await response.json();
        } catch (e) {
            result.error = true;
            return result;
        }

        // Обработка ошибок
        if (response.status < 200 || response.status >= 300) {
            result.error = true;

            if (useAuth && response.status === 401) {
                const refreshToken = AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey);
                
                if (refreshToken) {
                    const updated = await AuthUtils.updateRefreshToken();
                    
                    if (updated) {
                        const newAccessToken = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
                        
                        if (newAccessToken) {
                            params.headers['x-auth-token'] = newAccessToken;
                            
                            try {
                                response = await fetch(config.api + url, params);
                                result.response = await response.json();

                                if (response.status >= 200 && response.status < 300) {
                                    result.error = false;
                                }
                            } catch (retryError) {
                                result.error = true;
                            }
                        } else {
                            AuthUtils.removeAuthInfo();
                            localStorage.removeItem('userData');
                            result.redirect = "/login";
                        }
                    } else {
                        AuthUtils.removeAuthInfo();
                        localStorage.removeItem('userData');
                        result.redirect = "/login";
                    }
                } else {
                    AuthUtils.removeAuthInfo();
                    localStorage.removeItem('userData');
                    result.redirect = "/login";
                }
            }
        }

        return result;
    }
}