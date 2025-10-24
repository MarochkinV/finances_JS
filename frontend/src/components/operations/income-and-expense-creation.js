import {HttpUtils} from "../../utils/http-utils";

export class IncomeAndExpenseCreation {
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

        this.init().then();
    }

    async init() {
        this.initCancel();
        this.initValidationReset();
        this.initTypeFromQuery();
        await this.loadCategories();
        this.initTypeChange();
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

    //Сброс ошибок в полях
    initValidationReset() {
        const inputs = [this.typeSelect, this.categorySelect, this.amountInput, this.dateInput, this.commentTextarea];
        inputs.filter(Boolean).forEach((el) => {
            el.addEventListener('input', () => this.resetError(el));
            el.addEventListener('change', () => this.resetError(el));
        });
    }

    //Установка типа
    initTypeFromQuery() {
        const params = new URLSearchParams(window.location.search);
        const qsType = params.get('type'); // income | expense
        if (this.typeSelect && (qsType === 'income' || qsType === 'expense')) {
            this.typeSelect.value = qsType;
        }
    }

    //Смена типов
    initTypeChange() {
        if (!this.typeSelect) return;
        this.typeSelect.addEventListener('change', async () => {
            await this.loadCategories();
        });
    }

    //Сброс ошибки
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

    //Загрузка категорий
    async loadCategories() {
        if (!this.categorySelect || !this.typeSelect) return;
        const type = this.typeSelect.value;
        const url = type === 'income' ? '/categories/income' : '/categories/expense';
        const result = await HttpUtils.request(url, 'GET');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        const categories = Array.isArray(result.response) ? result.response : [];
        this.categorySelect.innerHTML = '<option value="" class="placeholder-option">Категория...</option>';
        categories.forEach((cat) => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.title;
            this.categorySelect.appendChild(opt);
        });
    }

    //Валидация
    validate() {
        let valid = true;
        const required = [
            {el: this.typeSelect, msg: 'Выберите тип'},
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
                type: this.typeSelect.value,
                category_id: Number(this.categorySelect.value),
                amount: Number(this.amountInput.value),
                date: this.dateInput.value,
                comment: this.commentTextarea.value.trim()?this.commentTextarea.value.trim():" ",
            };

            const result = await HttpUtils.request('/operations', 'POST', true, body);
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            await this.openNewRoute('/income-and-expense');
        });
    }
}