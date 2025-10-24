import {HttpUtils} from "../../utils/http-utils";

export class IncomeCategory {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.categoriesContainer = document.querySelector('.row');
        this.modalElement = document.getElementById('myModal');
        this.modalConfirmBtn = this.modalElement ? this.modalElement.querySelector('.btn-success') : null;
        this.categoryIdToDelete = null;

        this.actionsButtons();
        this.loadCategories().then();
    }

    //Действие на нажатие кнопок в блоках
    actionsButtons() {
        if (!this.categoriesContainer) {
            return;
        }
        //Кнопки в блоках с доходами
        this.categoriesContainer.addEventListener('click', (e) => {
            const target = e.target.closest('a,button');
            if (!target) return;

            //Создание +
            if (target.id === 'add-category') {
                e.preventDefault();
                return this.openNewRoute('/income-category-creation');
            }

            //Редактировать
            if (target.classList.contains('edit')) {
                e.preventDefault();
                const id = target.getAttribute('data-id');
                return this.openNewRoute(`/income-category-edit?id=${id}`);
            }

            //Удалить
            if (target.classList.contains('delete')) {
                e.preventDefault();
                const id = target.getAttribute('data-id');
                this.askDelete(id);
            }
        });

        //Подтверждение удаления в модальном окне
        if (this.modalConfirmBtn) {
            this.modalConfirmBtn.addEventListener('click', async () => {
                if (!this.categoryIdToDelete) return;
                await this.deleteCategory(this.categoryIdToDelete);
                this.categoryIdToDelete = null;
                //Закрытие
                const closeBtn = this.modalElement.querySelector('[data-dismiss="modal"]');
                if (closeBtn) closeBtn.click();
                await this.loadCategories();
            });
        }
    }


    //Загрузка категорий
    async loadCategories() {
        const result = await HttpUtils.request('/categories/income', 'GET');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        this.displayCategories(result.response);
    }

    //Отображение категорий
    displayCategories(categories) {
        if (!this.categoriesContainer) return;
        this.categoriesContainer.innerHTML = '';
        categories.forEach((cat) => {
            const col = document.createElement('div');
            col.className = 'col';
            col.innerHTML = `
                <div class="card card-outline shadow-none border border-gray-300 d-flex flex-column justify-content-center p-3 rounded-12">
                    <div>
                        <h3 class="text-info">${cat.title}</h3>
                    </div>
                    <div>
                        <a href="/income-category-edit?id=${cat.id}" data-id="${cat.id}" class="edit btn btn-primary pt-2 pb-2 pl-3 pr-3 rounded font-weight-medium">Редактировать</a>
                        <button type="button" class="delete btn btn-danger ml-2 pt-2 pb-2 pl-3 pr-3 rounded font-weight-medium" data-toggle="modal" data-target="#myModal" data-id="${cat.id}">Удалить</button>
                    </div>
                </div>`;
            this.categoriesContainer.appendChild(col);
        });

        //Блок добавления
        const addCol = document.createElement('div');
        addCol.className = 'col';
        addCol.innerHTML = `
            <div class="card card-outline shadow-none border border-gray-300 d-flex flex-column justify-content-center p-4 rounded-12">
                <a href="/income-category-creation" class="btn p-3 mb-2" id="add-category">
                    <i class="fas fa-plus text-secondary"></i>
                </a>
            </div>`;
        this.categoriesContainer.appendChild(addCol);
    }

    //Запрос ID для последующего удаления
    askDelete(id) {
        this.categoryIdToDelete = id;
    }

    //Удаление
    async deleteCategory(id) {
        const result = await HttpUtils.request(`/categories/income/${id}`, 'DELETE');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        //Оповещение об ошибке
        if (result.error) {
            return alert('Не удалось удалить категорию');
        }
    }
}