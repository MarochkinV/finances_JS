import {HttpUtils} from "../../utils/http-utils";

export class IncomeAndExpenseEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.formEl = document.querySelector('form');
        this.typeSelect = this.formEl ? this.formEl.querySelector('select[name="type"]') : null;
        this.categorySelect = this.formEl ? this.formEl.querySelector('select[name="category"]') : null;
        this.amountInput = this.formEl ? this.formEl.querySelector('input[name="amount"]') : null;
        this.dateInput = this.formEl ? this.formEl.querySelector('input[name="date"]') : null;
        this.commentTextarea = this.formEl ? this.formEl.querySelector('textarea[name="comment"]') : null;
        this.saveBtn = this.formEl ? this.formEl.querySelector('.btn-success') : null;
        this.cancelBtn = this.formEl ? this.formEl.querySelector('.btn-danger') : null;

        this.operationId = this.getIdFromQuery();
        this.operationData = null;

        this.init().then();
    }

    getIdFromQuery() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    //Инициализация
    async init() {
        if (!this.operationId) {
            return this.openNewRoute('/income-and-expense');
        }

        this.initCancel();
        this.initValidationReset();

        await this.loadOperation();
        if (!this.operationData) return;

        await this.loadCategories(this.operationData.type);
        this.fillForm(this.operationData);
        this.initSave();
    }

    //Кнопка отмена
    initCancel() {
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openNewRoute('/income-and-expense');
            });
        }
    }

    //Сброс ошибок
    initValidationReset() {
        const inputs = [this.categorySelect, this.amountInput, this.dateInput, this.commentTextarea];
        inputs.filter(Boolean).forEach((el) => {
            el.addEventListener('input', () => this.resetError(el));
            el.addEventListener('change', () => this.resetError(el));
        });
    }

    resetError(el) {
        el.classList.remove('border-danger', 'is-invalid');
        if (el.name === 'amount') {
            el.placeholder = 'Сумма в $...';
        } else if (el.name === 'date') {
            el.placeholder = '';
        } else if (el.name === 'comment') {
            el.placeholder = 'Комментарий...';
        }
    }

    //Згружаем данные операции
    async loadOperation() {
        const result = await HttpUtils.request(`/operations/${this.operationId}`, 'GET');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        if (result.error || !result.response) {
            return this.openNewRoute('/income-and-expense');
        }
        this.operationData = result.response;
    }

    //Загрузка категории
    async loadCategories(type) {
        if (!this.categorySelect) return;
        const url = type === 'income' ? '/categories/income' : '/categories/expense';
        const result = await HttpUtils.request(url, 'GET');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        const categories = Array.isArray(result.response) ? result.response : [];
        this.categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
        categories.forEach((cat) => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.title;
            this.categorySelect.appendChild(opt);
        });
    }

    //Заполнение формы данными об операции
    fillForm(op) {
        if (this.typeSelect) {
            this.typeSelect.value = op.type;
        }
        if (this.categorySelect) {
            const categoryName = op.category;

            if (categoryName && this.categorySelect.options) {
                let found = false;
                for (let i = 0; i < this.categorySelect.options.length; i++) {
                    const opt = this.categorySelect.options[i];
                    if (opt.textContent === categoryName) {
                        this.categorySelect.value = opt.value;
                        found = true;
                        break;
                    }
                }
            }
        }
        if (this.amountInput) {
            this.amountInput.value = op.amount;
        }
        if (this.dateInput) {
            this.dateInput.value = op.date;
        }
        if (this.commentTextarea) {
            this.commentTextarea.value = op.comment || '';
        }
    }

    //Валидация данных
    validate() {
        let valid = true;
        const required = [
            {el: this.categorySelect, msg: 'Выберите категорию'},
            {el: this.amountInput, msg: 'Сумма обязательна'},
            {el: this.dateInput, msg: 'Дата обязательна'},
        ];

        required.forEach(({el, msg}) => {
            if (!el) return;
            const val = (el.value || '').toString().trim();
            if (!val) {
                el.classList.add('border-danger', 'is-invalid');
                if (el.placeholder !== undefined) el.placeholder = msg;
                valid = false;
            }
        });

        if (valid && this.amountInput) {
            const amount = Number(this.amountInput.value);
            if (!Number.isFinite(amount) || amount <= 0) {
                this.amountInput.classList.add('border-danger', 'is-invalid');
                this.amountInput.placeholder = 'Введите положительное число';
                valid = false;
            }
        }
        return valid;
    }

    //Сохранение
    initSave() {
        if (!this.saveBtn) return;
        this.saveBtn.addEventListener('click', async () => {
            if (!this.validate()) return;

            const body = {
                type: this.operationData.type,
                category_id: Number(this.categorySelect.value),
                amount: Number(this.amountInput.value),
                date: this.dateInput.value,
                comment: this.commentTextarea.value.trim(),
            };

            const result = await HttpUtils.request(`/operations/${this.operationId}`, 'PUT', true, body);
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            await this.openNewRoute('/income-and-expense');
        });
    }
}