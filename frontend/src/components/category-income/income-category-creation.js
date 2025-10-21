import {HttpUtils} from "../../utils/http-utils";

export class IncomeCategoryCreation {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.formElement = document.querySelector('form');
        this.inputElement = this.formElement ? this.formElement.querySelector('input[type="text"]') : null;
        this.saveButton = this.formElement ? this.formElement.querySelector('.btn-success') : null;
        this.cancelLink = this.formElement ? this.formElement.querySelector('.btn-danger') : null;

        this.initActions();
    }

    //Инициализация действий
    initActions() {
        if (this.saveButton) {
            this.saveButton.addEventListener('click', this.create.bind(this));
        }
        if (this.cancelLink) {
            this.cancelLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openNewRoute('/income-category');
            });
        }

        //При вводе, скидываем ошибку
        if (this.inputElement) {
            this.inputElement.addEventListener('input', this.resetError.bind(this));
        }
    }

    //Метод сброса ошибки
    resetError() {
        if (this.inputElement) {
            this.inputElement.classList.remove('border-danger', 'is-invalid');
            this.inputElement.placeholder = 'Название...';
        }
    }

    //Метод создания категории
    async create() {
        const title = (this.inputElement?.value || '').trim();

        this.resetError();

        if (!title) {
            this.inputElement.classList.add('border-danger', 'is-invalid');
            this.inputElement.placeholder = 'Название категории не может быть пустым';
            return;
        }

        const result = await HttpUtils.request('/categories/income', 'POST', true, {title});
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        if (result.error || !result.response?.id) {
            return alert(result.response?.message || 'Не удалось создать категорию');
        }
        await this.openNewRoute('/income-category');
    }
}