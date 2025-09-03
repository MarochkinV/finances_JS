import {Login} from "./components/login";
import {SignUp} from "./components/sign-up";
import {Main} from "./components/main";
import {Logout} from "./components/logout";
import {IncomeAndExpense} from "./components/income-and-expense";
import {IncomeAndExpenseCreation} from "./components/income-and-expense-creation";
import {IncomeAndExpenseEdit} from "./components/income-and-expense-edit";
import {IncomeCategory} from "./components/income-category";
import {IncomeCategoryCreation} from "./components/income-category-creation";
import {IncomeCategoryEdit} from "./components/income-category-edit";
import {ExpenseCategory} from "./components/expense-category";
import {ExpenseCategoryCreation} from "./components/expense-category-creation";
import {ExpenseCategoryEdit} from "./components/expense-category-edit";





export class Router {
    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');
        this.adminLteStyleElement = document.getElementById('adminlte_style');

        this.initEvents();

        //Массив, который отвечает за наши страницы
        this.routes = [
            //Объект со страницей, далее по аналогии
            {
                route: '/', //Главная страница (Дашборд)
                title: 'Главная', //Вставка  title страницы
                filePathTemplate: '/templates/main.html', //Вставка шаблона со страницей HTML
                useLayout: '/templates/layout.html', //Вставляем там, где нужно загрузить, заранее подготовленный layout.html
                load: () => { //Загрузка компонента с классами JS определенной страницы
                    new Main();

                },
            },
            {
                route: '/404',
                title: 'Страница не найдена',
                filePathTemplate: '/templates/404.html',
                //load не добавляется для страницы 404 так как незачем, на этой странице нет кода JS
                useLayout: false,
            },
            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/login.html',
                useLayout: false,
                load: () => {
                    document.body.classList.add('login-page'); //Добавляем класс к body на странице login для правильного отображения контента, согласно шаблона AdminLTE
                    document.body.style.height = '100vh'; //Добавляем дополнительный стиль к body для правильного отображения контента, согласно шаблона AdminLTE
                    new Login(this.openNewRoute.bind(this));
                },
                unload: () => {
                    document.body.classList.remove('login-page'); //Удаляем класс после ухода со страницы
                    document.body.style.height = 'auto'; //Ставим стиль, который был изначально при уходе со страницы
                },
            },
            {
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/sign-up.html',
                useLayout: false,
                load: () => {
                    document.body.classList.add('register-page');
                    document.body.style.height = '100vh';
                    new SignUp(this.openNewRoute.bind(this));
                },
                unload: () => {
                    document.body.classList.remove('register-page');
                    document.body.style.height = 'auto';
                },
            },
            {
                route: '/logout',
                load: () => {
                    new Logout(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-and-expense',
                title: 'Доходы & Расходы',
                filePathTemplate: '/templates/income-and-expense.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeAndExpense(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-and-expense-creation',
                title: 'Создание дохода/расхода',
                filePathTemplate: '/templates/income-and-expense-creation.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeAndExpenseCreation(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-and-expense-edit',
                title: 'Создание дохода/расхода',
                filePathTemplate: '/templates/income-and-expense-edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeAndExpenseEdit(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-category',
                title: 'Доходы & Расходы',
                filePathTemplate: '/templates/income-category.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeCategory(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-category-creation',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/income-category-creation.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeCategoryCreation(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-category-edit',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/income-category-edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeCategoryEdit(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/expense-category',
                title: 'Доходы & Расходы',
                filePathTemplate: '/templates/expense-category.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new ExpenseCategory(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/expense-category-creation',
                title: 'Создание категории расходов',
                filePathTemplate: '/templates/expense-category-creation.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new ExpenseCategoryCreation(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/expense-category-edit',
                title: 'Редактирование категории расходов',
                filePathTemplate: '/templates/expense-category-edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new ExpenseCategoryEdit(this.openNewRoute.bind(this));
                },
            },
        ];


    }

    initEvents() {
        //В JavaScript значение this внутри функции зависит от контекста вызова. Когда браузер вызывает обработчик события (в данном случае activateRoute), он теряет привязку к this — то есть this внутри activateRoute может стать undefined (в строгом режиме) или указывать на window (в нестрогом), а не на экземпляр класса.Чтобы этого избежать, используется .bind(this) — это создаёт новую функцию, в которой this навсегда привязано к текущему экземпляру класса.Без .bind(this) вызов this.activateRoute внутри события может привести к ошибке, если в методе используется this для доступа к свойствам или другим методам класса.
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        //Событие п клику на любй элемент
        document.addEventListener('click', this.clickHandler.bind(this));
    };

    //Функция для навигации между маршрутами routers
    async openNewRoute(url) {
        const currentRoute = window.location.pathname;
        //Добавляем в историю браузера данные о новых URL адресах, без редиректа и перезагрузки приложения
        history.pushState({}, '', url);
        //Вызываем нужную страницу
        await this.activateRoute(null, currentRoute);
    };

    //Функция для загрузки новых страниц (newRoute), после нажатия click
    async clickHandler(e) {
        //Проверка клика на элемент ссылки, при нажатии на дочерний элемент, срабатывает родительский например - <a href="/" class="nav-link">
        let element = null;
        if (e.target.nodeName === 'A') {
            element = e.target;
        } else if (e.target.parentNode.nodeName === 'A') {
            element = e.target.parentNode;
        }
        //Проверка на то, что элемент существует и он ссылка
        if (element) {
            e.preventDefault();

            //Находим в ссылке строки с доменным именем и заменяем на пустую
            const url = element.href.replace(window.location.origin, '');
            //Проверка на то что в ссылке # или ничего нет, нужно завершить функционал
            if (!url || url === '/#' || url.startsWith('javascript:void(0)')) {
                return;
            }

            await this.openNewRoute(url);

        }
    };

    //Функция для активации страницы
    async activateRoute(e, oldRoute = null) {
        // Удаление стилей и вызов unload для старого маршрута
        if (oldRoute) {
            const currentRoute = this.routes.find(item => item.route === oldRoute);

            if (currentRoute) {
                // Удаляем стили
                if (currentRoute.styles && Array.isArray(currentRoute.styles)) {
                    currentRoute.styles.forEach(style => {
                        const link = document.querySelector(`link[href='/css/${style}']`);
                        if (link) {
                            link.remove();
                        }
                    });
                }

                // Вызываем unload
                if (currentRoute.unload && typeof currentRoute.unload === 'function') {
                    currentRoute.unload();
                }
            } else {
                console.warn(`Не удалось найти маршрут для очистки: ${oldRoute}`);
            }
        }

        //Определяем на какой мы странице
        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);

        if (newRoute) {
            //Проверка, имеются ли определенные стили которые нужно загрузить на страницу, в случае чего устанавливаем их
            if (newRoute.styles && newRoute.styles.length > 0) {
                newRoute.styles.forEach(style => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = '/css/' + style;
                    document.head.insertBefore(link, this.adminLteStyleElement); //Добавляем до <link rel="stylesheet" href="/css/adminlte.min.css" id="adminlte_style"> Если придется добавить, после, придется переделать этот кусок кода
                });
            }
            //Проверка, что title у routes существует
            if (newRoute.title) {
                this.titlePageElement.innerText = newRoute.title + ' | Freelance Studio';
            }

            //Вставляем шаблон (template)
            if (newRoute.filePathTemplate) {

                let contentBlock = this.contentPageElement;//Если layout отсутствует загружаем content без него
                //Проверяем есть ли layout и загружаем его в случае надобности и вставляем в id="content-layout" необходимый контент для страницы
                if (newRoute.useLayout) {

                    try {
                        const layoutHtml = await fetch(newRoute.useLayout).then(res => res.text());
                        this.contentPageElement.innerHTML = layoutHtml;

                        // ===Костыль 🛠 🔥 ИНИЦИАЛИЗИРУЕМ TREEVIEW ВРУЧНУЮ ===
                        if (typeof $.fn !== 'undefined' && typeof $.fn.Treeview !== 'undefined') {
                            $('[data-widget="treeview"]').Treeview('init');
                        } else {
                            console.warn('Treeview недоступен. Убедись, что adminlte.min.js загружен.');
                        }
                        // ===Костыль 🛠 🔥 ИНИЦИАЛИЗИРУЕМ TREEVIEW ВРУЧНУЮ ===

                        contentBlock = document.getElementById('content-layout');
                        document.body.classList.add('sidebar-mini', 'layout-fixed');
                    } catch (error) {
                        console.error('Ошибка загрузки layout:', error);
                    }

                    this.contentPageElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text());
                    contentBlock = document.getElementById('content-layout');
                    //Добавляем классы для сайдбара
                    document.body.classList.add('sidebar-mini')
                    document.body.classList.add('layout-fixed')
                } else {
                    //И удаляем если не требуются классы сайдбара
                    document.body.classList.remove('sidebar-mini')
                    document.body.classList.remove('layout-fixed')
                }
                contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());
            }


            //Проверяем есть ли в newRoute функция Load и вызываем ее
            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }


        } else {
            //Если route не найден, переводим на 404
            console.log('Маршрут не найден:', urlRoute);
            history.pushState({}, '', '/404');
            await this.activateRoute(null, urlRoute);
        }
    };
}



