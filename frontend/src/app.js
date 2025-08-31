import "./styles/styles.scss"; //Подключаем стили styles.scss
import {Router} from "./router.js"; //При использовании сборщика Webpack можно не ставить .js


class App {
    constructor() {

        //Подключаем роутер router (Управляет перемещениями по страницам и загрузками)
        new Router();
    }
}


//Создаем тут же экземпляр класса App Для подключения к index.html, что бы при запуске сразу сработал constructor
(new App());

