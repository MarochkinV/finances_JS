import Chart from 'chart.js/auto'
import {HttpUtils} from "../utils/http-utils";

export class Main {

    constructor() {
        this.currentFilter = 'today';
        this.interval = {from: null, to: null};
        this.hiddenDateInput = null;
        this.incomeChart = null;
        this.expenseChart = null;

        this.initEventListeners();

        this.restoreFilterFromStorage();
        window.addEventListener('beforeunload', () => {
            try {
                localStorage.removeItem('app_period_filter');
                localStorage.removeItem('app_period_from');
                localStorage.removeItem('app_period_to');
            } catch (_) {}
        });
        if (this.currentFilter === 'interval' && this.interval.from && this.interval.to) {
            this.getOperations('interval', this.interval.from, this.interval.to).then(async (ops) => {
                const {incomeData, expenseData} = this.buildChartData(ops || []);
                this.renderCharts(incomeData, expenseData);
            });
        } else if (this.currentFilter && this.currentFilter !== 'today') {
            this.getOperations(this.currentFilter).then(async (ops) => {
                const {incomeData, expenseData} = this.buildChartData(ops || []);
                this.renderCharts(incomeData, expenseData);
            });
        } else {
            this.getOperations('today').then(async (ops) => {
                const {incomeData, expenseData} = this.buildChartData(ops || []);
                this.renderCharts(incomeData, expenseData);
            });
        }
    }

    //Обработчик событий
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
                    this.interval = {from: null, to: null};
                    const toolbar = document.querySelector('.d-flex.align-items-center.pl-5.pb-5');
                    if (toolbar) {
                        const dateAnchors = toolbar.querySelectorAll('a.text-secondary');
                        if (dateAnchors && dateAnchors[0]) dateAnchors[0].textContent = 'Дата';
                        if (dateAnchors && dateAnchors[1]) dateAnchors[1].textContent = 'Дата';
                    }
                    this.persistIntervalToStorage();
                    this.getOperations(this.currentFilter).then((ops) => {
                        const {incomeData, expenseData} = this.buildChartData(ops || []);
                        this.renderCharts(incomeData, expenseData);
                    });
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
                    this.openHiddenDatePicker(async (value) => {
                        this.interval.to = value || null;
                        toAnchor.textContent = value ? this.formatDateForDisplay(value) : 'Дата';
                        this.persistIntervalToStorage();
                        if (this.interval.from && this.interval.to) {
                            const ops = await this.getOperations('interval', this.interval.from, this.interval.to);
                            const {incomeData, expenseData} = this.buildChartData(ops || []);
                            this.renderCharts(incomeData, expenseData);
                        }
                    }, this.interval.to);
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
        this.hiddenDateInput.style.top = '29%';
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

    setActiveFilter(activeButtonId) {
        const allButtons = document.querySelectorAll('.btn-outline-secondary');
        allButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.getElementById(activeButtonId);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    //Сохраняем в сторадж
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


    //Данные
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
        const result = await HttpUtils.request(url);
        if (result.redirect) return [];
        if (result.error || !result.response) return [];
        return result.response;
    }

    formatDateForDisplay(value) {
        const [y, m, d] = value.split('-');
        if (!y || !m || !d) return 'Дата';
        return `${d}.${m}.${y}`;
    }

    //Данные для диаграммы
    buildChartData(operations) {
        const incomeMap = new Map();
        const expenseMap = new Map();
        for (const op of operations) {
            const catObj = op.category;
            const title = (catObj && typeof catObj === 'object' ? (catObj.title || catObj.name) : null)
                || op.category_title
                || op.categoryTitle
                || op.category_name
                || op.categoryName
                || (typeof op.category === 'string' ? op.category : 'Без категории');
            const sum = Number(op.amount) || 0;
            if (op.type === 'income') {
                incomeMap.set(title, (incomeMap.get(title) || 0) + sum);
            } else if (op.type === 'expense') {
                expenseMap.set(title, (expenseMap.get(title) || 0) + sum);
            }
        }
        const incomeLabels = Array.from(incomeMap.keys());
        const incomeValues = Array.from(incomeMap.values());
        const expenseLabels = Array.from(expenseMap.keys());
        const expenseValues = Array.from(expenseMap.values());
        return {
            incomeData: {labels: incomeLabels, values: incomeValues},
            expenseData: {labels: expenseLabels, values: expenseValues}
        };
    }

    //Внешний вид диаграммы
    renderCharts(incomeData, expenseData) {
        const palette = [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
        ];

        const incomeCtx = document.getElementById('income_pie');
        const expenseCtx = document.getElementById('expense_pie');

        const makeDataset = (labels, values) => ({
            labels,
            datasets: [{
                data: values,
                backgroundColor: labels.map((_, i) => palette[i % palette.length])
            }]
        });

        const incomeChartData = makeDataset(incomeData.labels, incomeData.values);
        const expenseChartData = makeDataset(expenseData.labels, expenseData.values);

        if (this.incomeChart) {
            this.incomeChart.data = incomeChartData;
            this.incomeChart.update();
        } else if (incomeCtx) {
            this.incomeChart = new Chart(incomeCtx, { type: 'pie', data: incomeChartData, options: { responsive: true } });
        }

        if (this.expenseChart) {
            this.expenseChart.data = expenseChartData;
            this.expenseChart.update();
        } else if (expenseCtx) {
            this.expenseChart = new Chart(expenseCtx, { type: 'pie', data: expenseChartData, options: { responsive: true } });
        }
    }

}
