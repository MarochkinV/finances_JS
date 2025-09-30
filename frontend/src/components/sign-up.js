import {AuthUtils} from "../utils/auth-utils";
import {HttpUtils} from "../utils/http-utils";

export class SignUp {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        //Проверка, если пользователь уже залогинен, то отправляем его на главный дашбоард
        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute ('/');
        }

        this.nameElement = document.getElementById("name");
        this.lastNameElement = document.getElementById("last-name");
        this.emailElement = document.getElementById("email");
        this.passwordElement = document.getElementById("password");
        this.passwordRepeatElement = document.getElementById("password-repeat");
        // this.agreeMeElement = document.getElementById("agree");
        this.commonErrorElement = document.getElementById("common-error");

        //Обрабатываем нажатие на кнопку
        document.getElementById("process-button").addEventListener("click", this.signUp.bind(this));
    }

    //Функция для проверки полей
    validateForm() {
        //Переменная отвечающая на вопрос, валидна форма или нет
        let isValid = true;
        //Проверка для name and lastname
        if (this.nameElement.value) {
            this.nameElement.classList.remove("is-invalid") //В случае если пользователь исправил ошибку, следует убрать класс is-invalid
        } else {
            this.nameElement.classList.add("is-invalid"); //В случае ошибки добавляем класс is-invalid
            isValid = false;
        }
        if (this.lastNameElement.value) {
            this.lastNameElement.classList.remove("is-invalid") //В случае если пользователь исправил ошибку, следует убрать класс is-invalid
        } else {
            this.lastNameElement.classList.add("is-invalid"); //В случае ошибки добавляем класс is-invalid
            isValid = false;
        }
        //Проверка для email
        if (this.emailElement.value && this.emailElement.value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            this.emailElement.classList.remove("is-invalid") //В случае если пользователь исправил ошибку, следует убрать класс is-invalid
        } else {
            this.emailElement.classList.add("is-invalid"); //В случае ошибки добавляем класс is-invalid
            isValid = false;
        }
        //Проверка для password and repeatPassword
        if (this.passwordElement.value && this.passwordElement.value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) {
            this.passwordElement.classList.remove("is-invalid")
        } else {
            this.passwordElement.classList.add("is-invalid");
            isValid = false;
        }

        if (this.passwordRepeatElement.value && this.passwordRepeatElement.value === this.passwordElement.value) { //Проверка, что значения совпадают с полем password
            this.passwordRepeatElement.classList.remove("is-invalid")
        } else {
            this.passwordRepeatElement.classList.add("is-invalid");
            isValid = false;
        }

        return isValid;
    }

    //Функция отправки запроса
    async signUp() {
        //Сообщение об ошибке не показывается без необходимости
        this.commonErrorElement.style.display = "none";

        if (this.validateForm()) {
            const result = await HttpUtils.request('/signup', 'POST', {
                name: this.nameElement.value,
                lastName: this.lastNameElement.value,
                email: this.emailElement.value,
                password: this.passwordElement.value,
                passwordRepeat: this.passwordRepeatElement.value
            })
            //Проверка result на наличие ошибки или отсутствия какого либо значения, в случае ошибки показывается сообщение
            if (result.error || !result.response || (result.response && (!result.response.user.id || !result.response.user.name))) {
                this.commonErrorElement.style.display = "block";
                return;
            }
            //Сохранение токенов и рефрештокенов используем auth-utils.js там прописан данный функционал
            AuthUtils.setAuthInfo(result.response.accessToken, result.response.refreshToken, {id: result.response.user.id, name: result.response.user.name});

            //Сохраняем данные пользователя в localStorage для отображения в user panel 📌
            localStorage.setItem('userData', JSON.stringify({
                name: result.response.user.name + ' ' + result.response.user.lastName,
                email: result.response.user.email,
                id: result.response.user.id
            }));

            //Перевод пользователя на главную страницу
            this.openNewRoute('/login');

        }
    };
}