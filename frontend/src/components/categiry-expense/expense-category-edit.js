import {HttpUtils} from "../../utils/http-utils";

export class ExpenseCategoryEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.formElement = document.querySelector('form');
        this.inputElement = this.formElement ? this.formElement.querySelector('input[type="text"]') : null;
        this.saveButton = this.formElement ? this.formElement.querySelector('.btn-success') : null;
        this.cancelLink = this.formElement ? this.formElement.querySelector('.btn-danger') : null;
        this.id = this.getIdFromUrl();

        this.initActions();
        this.load().then();
    }

    getIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    initActions() {
        if (this.saveButton) {
            this.saveButton.addEventListener('click', this.save.bind(this));
        }
        if (this.cancelLink) {
            this.cancelLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openNewRoute('/expense-category');
            });
        }

        if (this.inputElement) {
            this.inputElement.addEventListener('input', this.resetError.bind(this));
        }
    }

    //Загрузка данных из категории
    async load() {
        const result = await HttpUtils.request(`/categories/expense/${this.id}`, 'GET');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        if (this.inputElement) {
            this.inputElement.value = result.response.title;
        }
    }

    // Метод сброса ошибки
    resetError() {
        if (this.inputElement) {
            this.inputElement.classList.remove('border-danger', 'is-invalid');
            this.inputElement.placeholder = 'Название...';
        }
    }

    //Сохранение изменений
    async save() {
        const title = (this.inputElement?.value || '').trim();

        // Сбрасываем предыдущие ошибки
        this.resetError();

        if (!title) {
            // Добавляем классы Bootstrap для ошибки
            this.inputElement.classList.add('border-danger', 'is-invalid');
            this.inputElement.placeholder = 'Название категории не может быть пустым';
            return;
        }

        const result = await HttpUtils.request(`/categories/expense/${this.id}`, 'PUT', true, {title});
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        if (result.error) {
            return alert(result.response?.message || 'Не удалось редактировать категорию');
        }
        await this.openNewRoute('/expense-category');
    }
}