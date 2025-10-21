import {Login} from "./components/auth/login";
import {SignUp} from "./components/auth/sign-up";
import {Main} from "./components/main";
import {Logout} from "./components/auth/logout";
import {IncomeAndExpense} from "./components/operations/income-and-expense";
import {IncomeAndExpenseCreation} from "./components/operations/income-and-expense-creation";
import {IncomeAndExpenseEdit} from "./components/operations/income-and-expense-edit";
import {IncomeCategory} from "./components/category-income/income-category";
import {IncomeCategoryCreation} from "./components/category-income/income-category-creation";
import {IncomeCategoryEdit} from "./components/category-income/income-category-edit";
import {ExpenseCategory} from "./components/categiry-expense/expense-category";
import {ExpenseCategoryCreation} from "./components/categiry-expense/expense-category-creation";
import {ExpenseCategoryEdit} from "./components/categiry-expense/expense-category-edit";
import {HttpUtils} from "./utils/http-utils";


export class Router {
    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');
        this.adminLteStyleElement = document.getElementById('adminlte_style');

        this.initEvents();

        //Инициализация активного состояния меню при создании роутера
        this.initMenuActiveState();

        //Добавляем обновление имени пользователя при инициализации роутера
        this.updateUserName();

        //Добавление баланса пользователя
        this.getBalanceInfo().then();

        //Массив, который отвечает за наши страницы
        this.routes = [
            //Объект со страницей, далее по аналогии
            {
                route: '/', //Главная страница (Дашборд)
                title: 'Главная', //Вставка  title страницы
                filePathTemplate: '/templates/pages/main.html', //Вставка шаблона со страницей HTML
                useLayout: '/templates/layout.html', //Вставляем там, где нужно загрузить, заранее подготовленный layout.html
                requiresAuth: true, //Требует авторизации true or false
                load: () => { //Загрузка компонента с классами JS определенной страницы
                    new Main();

                },
            },
            {
                route: '/404',
                title: 'Страница не найдена',
                filePathTemplate: '/templates/pages/404.html',
                //load не добавляется для страницы 404 так как незачем, на этой странице нет кода JS
                useLayout: false,
                requiresAuth: false,
            },
            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/auth/login.html',
                useLayout: false,
                requiresAuth: false,
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
                filePathTemplate: '/templates/auth/sign-up.html',
                useLayout: false,
                requiresAuth: false,
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
                requiresAuth: true,
                load: () => {
                    new Logout(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-and-expense',
                title: 'Доходы & Расходы',
                filePathTemplate: '/templates/pages/operations/income-and-expense.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    new IncomeAndExpense(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-and-expense-creation',
                title: 'Создание дохода/расхода',
                filePathTemplate: '/templates/pages/operations/income-and-expense-creation.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    new IncomeAndExpenseCreation(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-and-expense-edit',
                title: 'Создание дохода/расхода',
                filePathTemplate: '/templates/pages/operations/income-and-expense-edit.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    new IncomeAndExpenseEdit(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/income-category',
                title: 'Доходы & Расходы',
                filePathTemplate: '/templates/pages/category-income/income-category.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    document.getElementById('income-expense-category').classList.add('menu-open');
                    new IncomeCategory(this.openNewRoute.bind(this));
                },
                unload: () => {
                    document.getElementById('income-expense-category').classList.remove('menu-open');
                },
            },
            {
                route: '/income-category-creation',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/pages/category-income/income-category-creation.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    document.getElementById('income-expense-category').classList.add('menu-open');
                    new IncomeCategoryCreation(this.openNewRoute.bind(this));
                },
                unload: () => {
                    document.getElementById('income-expense-category').classList.remove('menu-open');
                },
            },
            {
                route: '/income-category-edit',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/pages/category-income/income-category-edit.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    document.getElementById('income-expense-category').classList.add('menu-open');
                    new IncomeCategoryEdit(this.openNewRoute.bind(this));
                },
                unload: () => {
                    document.getElementById('income-expense-category').classList.remove('menu-open');
                },
            },
            {
                route: '/expense-category',
                title: 'Доходы & Расходы',
                filePathTemplate: '/templates/pages/category-expense/expense-category.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    document.getElementById('income-expense-category').classList.add('menu-open');
                    new ExpenseCategory(this.openNewRoute.bind(this));
                },
                unload: () => {
                    document.getElementById('income-expense-category').classList.remove('menu-open');
                },
            },
            {
                route: '/expense-category-creation',
                title: 'Создание категории расходов',
                filePathTemplate: '/templates/pages/category-expense/expense-category-creation.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    document.getElementById('income-expense-category').classList.add('menu-open');
                    new ExpenseCategoryCreation(this.openNewRoute.bind(this));
                },
                unload: () => {
                    document.getElementById('income-expense-category').classList.remove('menu-open');
                },
            },
            {
                route: '/expense-category-edit',
                title: 'Редактирование категории расходов',
                filePathTemplate: '/templates/pages/category-expense/expense-category-edit.html',
                useLayout: '/templates/layout.html',
                requiresAuth: true,
                load: () => {
                    document.getElementById('income-expense-category').classList.add('menu-open');
                    new ExpenseCategoryEdit(this.openNewRoute.bind(this));
                },
                unload: () => {
                    document.getElementById('income-expense-category').classList.remove('menu-open');
                },
            },
        ];

    }

    //Метод для проверки авторизации пользователя
    isAuthenticated() {
        const userData = localStorage.getItem('userData');
        return userData !== null && userData !== undefined;
    }

    // Метод для перенаправления неавторизованных пользователей
    redirectToLogin() {
        if (window.location.pathname !== '/login') {
            history.replaceState({}, '', '/login');
            this.activateRoute();
        }
    }

    //Метод для инициализации активного состояния меню
    initMenuActiveState() {
        // Сохраняем текущий активный пункт в sessionStorage для сохранения между перезагрузками
        const savedActiveItem = sessionStorage.getItem('activeMenuItem');
        if (savedActiveItem) {
            // Устанавливаем с небольшой задержкой чтобы DOM успел полностью загрузиться
            setTimeout(() => {
                this.setActiveMenuItem(savedActiveItem);
            }, 100);
        }
    }

    // Метод для установки активного пункта меню
    setActiveMenuItem(currentRoute) {
        // Удаляем активный класс у всех пунктов меню
        const allNavLinks = document.querySelectorAll('.nav-sidebar .nav-link');
        allNavLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Определяем, какой маршрут должен быть активным в меню
        let activeRoute = currentRoute;

        // Если текущий маршрут — это подстраница категории доходов, используем родительский маршрут
        if (currentRoute.startsWith('/income-category-')) {
            activeRoute = '/income-category';
        } else if (currentRoute.startsWith('/expense-category-')) {
            activeRoute = '/expense-category';
        } else if (currentRoute.startsWith('/income-and-expense-')) {
            activeRoute = '/income-and-expense';
        }

        // Находим и активируем соответствующий пункт меню по href
        const targetLink = document.querySelector(`.nav-sidebar .nav-link[href="${activeRoute}"]`);

        if (targetLink) {
            targetLink.classList.add('active');

            // Активируем родительский пункт, если это подменю
            const parentItem = targetLink.closest('.nav-treeview');
            if (parentItem) {
                const parentLink = parentItem.previousElementSibling;
                if (parentLink && parentLink.classList.contains('nav-link')) {
                    parentLink.classList.add('active');
                }
            }

            // Сохраняем исходный маршрут (не родительский!) для восстановления после перезагрузки
            sessionStorage.setItem('activeMenuItem', currentRoute);
        }
    }

    //Метод для обновления имени пользователя в user panel
    updateUserName() {
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            const userData = localStorage.getItem('userData');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    // Используем fullName если есть, иначе name
                    userNameElement.textContent = user.fullName || user.name || 'Пользователь';
                } catch (e) {
                    console.error('Ошибка парсинга userData:', e);
                    userNameElement.textContent = 'Пользователь';
                }
            }
        }
    }


    //Метод для отображения баланса
   async getBalanceInfo() {
       try {
           const result = await HttpUtils.request('/balance', 'GET');
           //если есть ошибка и заполнен редирект
           if (result.error||result.redirect) {
               return this.openNewRoute(result.redirect);
           }


           const balanceElement = document.getElementById('balance');
           if (balanceElement && result?.response?.balance !== undefined) {
               balanceElement.innerText = result.response.balance + '$';
           }

       } catch (error) {
           const balanceElement = document.getElementById('balance');
           if (balanceElement) {
               balanceElement.innerText = 'Ошибка';
           }
       }
   }

    initEvents() {
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

        //Проверка авторизации для защищенных маршрутов
        if (newRoute && newRoute.requiresAuth && !this.isAuthenticated()) {
            this.redirectToLogin();
            return;
        }


        if (this.isAuthenticated() && (urlRoute === '/login' || urlRoute === '/sign-up')) {
            history.replaceState({}, '', '/');
            await this.activateRoute();
            return;
        }

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
                this.titlePageElement.innerText = newRoute.title + ' | Lumincoin Finance';
            }

            //Вставляем шаблон (template)
            if (newRoute.filePathTemplate) {

                let contentBlock = this.contentPageElement;//Если layout отсутствует загружаем content без него
                //Проверяем есть ли layout и загружаем его в случае надобности и вставляем в id="content-layout" необходимый контент для страницы
                if (newRoute.useLayout) {

                    try {
                        //Инициализация Treeview
                        setTimeout(() => {
                            $('[data-widget="treeview"]').Treeview('init');
                        }, 100);

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

                //Обновляем имя пользователя после загрузки контента
                this.updateUserName();
                //Устанавливаем активное состояние меню после загрузки контента
                setTimeout(() => {
                    this.setActiveMenuItem(newRoute.route);
                }, 100);

                //Отображение баланса
                if (this.isAuthenticated()&&(newRoute!=='/login')) {
                    const balanceElement = document.getElementById('balance');
                    if (balanceElement) {
                        this.getBalanceInfo().then();
                    }
                }
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