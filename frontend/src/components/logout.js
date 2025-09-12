import {AuthUtils} from "../utils/auth-utils";
import {HttpUtils} from "../utils/http-utils";

export class Logout {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        //Проверка, на то если пользователь уже залогинен, если нет, то отправляем его на страницу login
        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) {
            return this.openNewRoute('/login');
        }

        this.logout().then();

    }

    //Функция для разлогинивания пользователя
    async logout() {

        await HttpUtils.request('/logout', 'POST', {
            refreshToken: AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey),
        })


        //Удаление токенов, рефрештокенов и информации о пользователе используем auth-utils.js там прописан данный функционал
        AuthUtils.removeAuthInfo();

        //Удаляем данные пользователя из localStorage при выходе из системы 📌
        localStorage.removeItem('userData');

        //Перевод пользователя на страницу /login
        this.openNewRoute('/login');
    };
}