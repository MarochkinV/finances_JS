import {AuthUtils} from "../utils/auth-utils";
import {HttpUtils} from "../utils/http-utils";

export class Login {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        //Проверка, если пользователь уже залогинен, то отправляем его на главный дашбоард, используем auth-utils.js там прописан данный функционал
        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute('/');
        }


        this.emailElement = document.getElementById("email");
        this.passwordElement = document.getElementById("password");
        this.rememberMeElement = document.getElementById("remember-me");
        this.commonErrorElement = document.getElementById("common-error");

        //Обрабатываем нажатие на кнопку
        document.getElementById("process-button").addEventListener("click", this.login.bind(this)); //bind(this) Что бы контекст не менялся, который будет в обработчике события
    }

    //Функция для проверки полей Поле не пустое и поле совпадает с регулярными выражениями
    validateForm() {
        //Переменная отвечающая на вопрос, валидна форма или нет
        let isValid = true;

        //Проверка для email
        if (this.emailElement.value && this.emailElement.value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            this.emailElement.classList.remove("is-invalid") //В случае если пользователь исправил ошибку, следует убрать класс is-invalid
        } else {
            this.emailElement.classList.add("is-invalid"); //В случае ошибки добавляем класс is-invalid
            isValid = false;
        }
        //Проверка для password (Валидацию по регулярке не проверяем, так как незачем на страничке login!)
        if (this.passwordElement.value) {
            this.passwordElement.classList.remove("is-invalid") //В случае если пользователь исправил ошибку, следует убрать класс is-invalid
        } else {
            this.passwordElement.classList.add("is-invalid"); //В случае ошибки добавляем класс is-invalid
            isValid = false;
        }

        return isValid;
    }

    //Функция отправки запроса
    async login() {
        //Сообщение об ошибке не показывается без необходимости
        this.commonErrorElement.style.display = "none";

        if (this.validateForm()) {

            const result = await HttpUtils.request('/login', 'POST', {
                email: this.emailElement.value,
                password: this.passwordElement.value,
                rememberMe: this.rememberMeElement.checked
            })


            //Проверка result на наличие ошибки или отсутствия какого либо значения, в случае ошибки показывается сообщение
            if (result.error || !result.response || (result.response && (!result.response.tokens.accessToken || !result.response.tokens.refreshToken || !result.response.user.id || !result.response.user.name))) {
                this.commonErrorElement.style.display = "block";
                return;
            }

            //Сохранение токенов и рефрештокенов используем auth-utils.js там прописан данный функционал
            AuthUtils.setAuthInfo(result.response.tokens.accessToken, result.response.tokens.refreshToken, {id: result.response.user.id, name: result.response.user.name});


            //Перевод пользователя на главную страницу
            this.openNewRoute('/');
        }
    };
}
