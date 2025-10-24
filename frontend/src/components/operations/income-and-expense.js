import {HttpUtils} from "../../utils/http-utils";

export class IncomeAndExpense {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.currentFilter = 'today'; // Текущий фильтр по умолчанию
        this.interval = {from: null, to: null};
        this.hiddenDateInput = null;
        this.modalElement = document.getElementById('myModal');
        this.modalConfirmBtn = this.modalElement ? this.modalElement.querySelector('.btn-success') : null;
        this.operationIdToDelete = null;
        this.recordsTableBody = null;
        this.addIncomeBtn = null;
        this.addExpenseBtn = null;

        this.restoreFilterFromStorage();
        window.addEventListener('beforeunload', () => {
            try {
                localStorage.removeItem('app_period_filter');
                localStorage.removeItem('app_period_from');
                localStorage.removeItem('app_period_to');
            } catch (_) {}
        });

        if (this.currentFilter === 'interval' && this.interval.from && this.interval.to) {
            this.getOperations('interval', this.interval.from, this.interval.to).then();
        } else if (this.currentFilter && this.currentFilter !== 'today') {
            this.getOperations(this.currentFilter).then();
        } else {
            this.getOperations('today').then();
        }
        this.initEventListeners();
    }

    //Метод для запроса всех операций
    async getOperations(filter = null, dateFrom = null, dateTo = null) {
        let url = '/operations';
        if (filter) {
            const params = new URLSearchParams();
            params.set('period', filter);
            if (filter === 'interval' && dateFrom && dateTo) {
                params.set('dateFrom', dateFrom);
                params.set('dateTo', dateTo);
            }
            url = `/operations?${params.toString()}`;
        }
        const result = await HttpUtils.request(url)

        //Если нет токенов, делаем редирект
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        //Проверка result
        if (result.error || !result.response) {
            return alert('Ошибка при запросе операций')
        }

        this.showRecords(result.response);
    };

    //Обработчик кнопок с периодами года
    initEventListeners() {
        const periodsButtons = {
            'btn-today': 'today',
            'btn-week': 'week',
            'btn-month': 'month',
            'btn-year': 'year',
            'btn-all-periods-calendar': 'all',
            'btn-interval': 'interval'
        };

        Object.keys(periodsButtons).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    this.setActiveFilter(buttonId);
                    this.currentFilter = periodsButtons[buttonId];
                    this.persistFilterToStorage();
                    if (buttonId === 'btn-interval') {
                        return;
                    }
                    this.resetIntervalDates();
                    this.persistIntervalToStorage();
                    this.getOperations(this.currentFilter).then();
                });
            }
        });

        const toolbar = document.querySelector('.d-flex.align-items-center.pl-5.pb-5');
        let dateAnchors = [];
        if (toolbar) {
            dateAnchors = toolbar.querySelectorAll('a.text-secondary');
        }
        const fromAnchor = dateAnchors && dateAnchors[0] ? dateAnchors[0] : null;
        const toAnchor = dateAnchors && dateAnchors[1] ? dateAnchors[1] : null;


        this.hiddenDateInput = document.createElement('input');
        this.hiddenDateInput.type = 'date';
        this.hiddenDateInput.style.position = 'absolute';
        this.hiddenDateInput.style.left = '-9999px';
        document.body.appendChild(this.hiddenDateInput);

        if (fromAnchor) {
            fromAnchor.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.currentFilter === 'interval') {
                    //Интервал
                    this.openHiddenDatePicker((value) => {
                        this.interval.from = value || null;
                        fromAnchor.textContent = value ? this.formatDateForDisplay(value) : 'Дата';
                        this.persistIntervalToStorage();
                    }, this.interval.from);
                }
            });
        }

        if (toAnchor) {
            toAnchor.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.currentFilter === 'interval') {
                    //Интервал
                    this.openHiddenDatePicker(async (value) => {
                        this.interval.to = value || null;
                        toAnchor.textContent = value ? this.formatDateForDisplay(value) : 'Дата';
                        this.persistIntervalToStorage();

                        if (this.interval.from && this.interval.to) {
                            const errorMessage = this.validateDates(this.interval.from, this.interval.to);
                            if (errorMessage) {
                                return alert(errorMessage);
                            }
                            await this.getOperations('interval', this.interval.from, this.interval.to);
                        }
                    }, this.interval.to);
                }
            });
        }

        //Инициализация событий для создания операций
        this.addIncomeBtn = document.getElementById('btn-add-income');
        this.addExpenseBtn = document.getElementById('btn-add-expense');
        if (this.addIncomeBtn) {
            this.addIncomeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openNewRoute('/income-and-expense-creation?type=income');
            });
        }
        if (this.addExpenseBtn) {
            this.addExpenseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openNewRoute('/income-and-expense-creation?type=expense');
            });
        }


        this.recordsTableBody = document.getElementById('records');
        if (this.recordsTableBody) {
            this.recordsTableBody.addEventListener('click', (e) => {
                const delBtn = e.target.closest('button.delete');

                if (!delBtn) return;

                e.preventDefault();
                const opId = delBtn.getAttribute('data-operation-id');
                this.askDelete(opId);
            });
        }

        //Подтверждение удаления в модальном окне
        if (this.modalConfirmBtn) {
            this.modalConfirmBtn.addEventListener('click', async () => {
                if (!this.operationIdToDelete) return;
                await this.deleteOperation(this.operationIdToDelete);
                this.operationIdToDelete = null;
                const closeBtn = this.modalElement?.querySelector('[data-dismiss="modal"]');

                if (closeBtn) closeBtn.click();

                if (this.currentFilter === 'interval' && this.interval.from && this.interval.to) {
                    await this.getOperations('interval', this.interval.from, this.interval.to);
                } else {
                    await this.getOperations(this.currentFilter);
                }
            });
        }
    }

    //Обработчик открытия календаря
    openHiddenDatePicker(onChange, initialValue) {
        if (!this.hiddenDateInput) return;

        this.hiddenDateInput.onchange = null;
        this.hiddenDateInput.value = initialValue || '';

        this.hiddenDateInput.onchange = () => {
            onChange && onChange(this.hiddenDateInput.value);
            this.hiddenDateInput.style.left = '-9999px';
            this.hiddenDateInput.style.top = '0px';
            this.hiddenDateInput.style.width = '';
            this.hiddenDateInput.style.height = '';
            this.hiddenDateInput.style.opacity = '1';
            this.hiddenDateInput.style.position = 'absolute';
        };

        this.hiddenDateInput.style.position = 'fixed';
        this.hiddenDateInput.style.left = '50%';
        this.hiddenDateInput.style.top = '38%';
        this.hiddenDateInput.style.width = '1px';
        this.hiddenDateInput.style.height = '1px';
        this.hiddenDateInput.style.opacity = '0';

        try {
            this.hiddenDateInput.focus({ preventScroll: true });
        } catch (e) {
            try { this.hiddenDateInput.focus(); } catch (_) {}
        }

        if (typeof this.hiddenDateInput.showPicker === 'function') {
            try {
                this.hiddenDateInput.showPicker();
                return;
            } catch (e) {}
        }

        this.hiddenDateInput.click();
    }

    //Сброс интервала
    resetIntervalDates() {
        this.interval = {from: null, to: null};
        const toolbar = document.querySelector('.d-flex.align-items-center.pl-5.pb-5');
        if (!toolbar) {
            return;
        }
        const dateAnchors = toolbar.querySelectorAll('a.text-secondary');
        if (dateAnchors && dateAnchors[0]) {
            dateAnchors[0].textContent = 'Дата';
        }
        if (dateAnchors && dateAnchors[1]) {
            dateAnchors[1].textContent = 'Дата';
        }
    }

    validateDates(dateFrom, dateTo) {
        if (!dateFrom || !dateTo) {
            return 'Укажите обе даты: с и по.';
        }
        if (dateFrom > dateTo) {
            return 'Дата "с" не может быть позже даты "по".';
        }
        return null;
    }

    //Нужный формат даты
    formatDateForDisplay(value) {
        const [y, m, d] = value.split('-');
        if (!y || !m || !d) {
            return 'Дата';
        }
        return `${d}.${m}.${y}`;
    }

    //Установка активной кнопки с периодом
    setActiveFilter(activeButtonId) {

        const allButtons = document.querySelectorAll('.btn-outline-secondary');
        allButtons.forEach(btn => btn.classList.remove('active'));

        const activeButton = document.getElementById(activeButtonId);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    persistFilterToStorage() {
        try {
            localStorage.setItem('app_period_filter', this.currentFilter || 'today');
        } catch (_) {}
    }

    persistIntervalToStorage() {
        try {
            if (this.currentFilter === 'interval') {
                localStorage.setItem('app_period_from', this.interval.from || '');
                localStorage.setItem('app_period_to', this.interval.to || '');
            } else {
                localStorage.removeItem('app_period_from');
                localStorage.removeItem('app_period_to');
            }
        } catch (_) {}
    }

    restoreFilterFromStorage() {
        try {
            const saved = localStorage.getItem('app_period_filter');
            const filter = saved || 'today';
            this.currentFilter = filter;
            const buttonId = this.buttonIdByFilter(filter);
            if (buttonId) this.setActiveFilter(buttonId);
            if (filter === 'interval') {
                const from = localStorage.getItem('app_period_from') || '';
                const to = localStorage.getItem('app_period_to') || '';
                this.interval = {from: from || null, to: to || null};
                this.updateDateAnchors(from, to);
            } else {
                this.updateDateAnchors(null, null);
            }
        } catch (_) {}
    }

    buttonIdByFilter(filter) {
        switch (filter) {
            case 'today': return 'btn-today';
            case 'week': return 'btn-week';
            case 'month': return 'btn-month';
            case 'year': return 'btn-year';
            case 'all': return 'btn-all-periods-calendar';
            case 'interval': return 'btn-interval';
            default: return 'btn-today';
        }
    }

    updateDateAnchors(from, to) {
        const toolbar = document.querySelector('.d-flex.align-items-center.pl-5.pb-5');
        if (!toolbar) return;
        const dateAnchors = toolbar.querySelectorAll('a.text-secondary');
        if (dateAnchors && dateAnchors[0]) dateAnchors[0].textContent = from ? this.formatDateForDisplay(from) : 'Дата';
        if (dateAnchors && dateAnchors[1]) dateAnchors[1].textContent = to ? this.formatDateForDisplay(to) : 'Дата';
    }

    showRecords(operations) {
        const recordsElement = document.getElementById("records");
        recordsElement.innerHTML = '';

        //Создание таблицы с операцией
        for (let i = 0; i < operations.length; i++) {
            //Строка
            const trElement = document.createElement("tr");

            //Порядковый номер
            trElement.insertCell().innerText = i + 1;

            //Тип операции
            let typeCell = trElement.insertCell();
            switch (operations[i].type) {
                case "income":
                    typeCell.innerHTML = '<span class="text-success">Доход</span>';
                    break;
                case "expense":
                    typeCell.innerHTML = '<span class="text-danger">Расход</span>';
                    break;
                default:
                    typeCell.innerText = operations[i].type;
            }

            //Категория
            const cat = operations[i].category;
            const categoryText = (cat && typeof cat === 'object' ? (cat.title || cat.name) : null)
                || operations[i].category_title
                || operations[i].categoryTitle
                || operations[i].category_name
                || operations[i].categoryName
                || (typeof cat === 'string' || typeof cat === 'number' ? String(cat) : '')
                || '';
            trElement.insertCell().innerText = categoryText;

            //Сумма
            trElement.insertCell().innerText = operations[i].amount + '$';


            //Дата
            const formattedDate = operations[i].date ? this.formatDateForDisplay(operations[i].date) : '';
            trElement.insertCell().innerText = formattedDate;

            //Комментарий
            trElement.insertCell().innerText = operations[i].comment || '';

            //Кнопки действий
            const actionsCell = trElement.insertCell();
            actionsCell.className = 'text-right';
            actionsCell.innerHTML = `
                <button class="delete btn" type="button" data-toggle="modal" data-target="#myModal" data-operation-id="${operations[i].id}">
                    <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z" fill="black"/>
                        <path d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z" fill="black"/>
                        <path d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z" fill="black"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z" fill="black"/>
                    </svg>
                </button>
                <a href="/income-and-expense-edit?id=${operations[i].id}" class="btn" style="padding:0;">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z" fill="black"/>
                    </svg>
                </a>
            `;
            recordsElement.appendChild(trElement);
        }
    };

    askDelete(id) {
        this.operationIdToDelete = id;
    }

    async deleteOperation(id) {
        const result = await HttpUtils.request(`/operations/${id}`, 'DELETE');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        if (result.error) {
            return alert('Не удалось удалить операцию');
        }
    }
}