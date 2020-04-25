class App {
    constructor() {
        // Состояние приложения:
        this.state = {
            products: [],
            sortBy: 'NAME',
            sortOrder: 'DESC',
            status: 'SORTING',
        };
        // Данные для доступа к JSON серверу
        this.JSONBin = {
            root: 'https://api.jsonbin.io',
            binId: '5e962adc5fa47104cea07c45',
            binVersion: 'latest',
            key: '$2b$10$ltjATMhqY0JfYN5Mi1k1nOVTEQIGJwabv1R6Fb9CUjOUl7jTe6PwG',
        };
        // Входные данные
        this.inputs = {
            search: '',
            name: '',
            email: '',
            count: '',
            price: '',
        };
        // Навешиваем обработчики на кнопки и загружаем данные
        this.inputsInit();
        this.getData();
    };

    // Null object товара
    nullProduct = {
        id: null,
        name: 'New Product',
        email: null,
        count: null,
        price: null,
        delivery: 
            {
                russia: { moskow: false, novosibirsk: false, krasnoyarsk: false },
                usa: { newYork: false, houston: false, sanFrancisco: false },
                belarus: { minsk: false, homyel: false, mahilyow: false },
            },
    };

    // Инициализация инпутов
    inputsInit() {
        $('#searchRequest').on('keypress', (e) => e.which == 13 ? this.searchHandler() : null);
        $('#searchButton').click(this.searchHandler);
        $('#addNewButton').click({ product: this.nullProduct }, this.editHandler);
    };

    // Отобразить спиннер загрузки
    showLoading() {
        $('#deleteModal').hide();
        $('#editModal').hide();
        $('#backdrop').show();
        $('#loading').show();
    };

    // запрос списка товаров
    getData() {
        const { JSONBin } = this;
        const url = [JSONBin.root, 'b', JSONBin.binId, JSONBin.binVersion].join('/');
        $.ajax({
            type: 'GET',
            headers: {
                'secret-key': JSONBin.key,
            },
            url,
            beforeSend:  () => {
                this.showLoading();
            },
        })
        .then((response) => {
            this.state.products = response;
        })
        .catch(() => {
            alert('Error while JSON GET');
        })
        // Если пришел ответ, то отрисовываем приложение
        .then(() => {
            this.render();
        })
        .catch(() => {
            alert('Error while render');
        });
    };

    // отправка списка товаров 
    putData() {
        const { JSONBin } = this;
        const { products } = this.state;
        const url = [JSONBin.root, 'b', JSONBin.binId].join('/');
        // Проебразуем массив товаров в JSON 
        const data = JSON.stringify(products);
        // Отправляем новый список товаров на сервер
        $.ajax({
            type: 'PUT',
            headers: {
                'secret-key': JSONBin.key,
                "Content-Type": "application/json",
            },
            data,
            url,
            beforeSend:  () => {
                this.showLoading();
            },
        })
        // В ответе получаем новый список товаров
        .then(({ data }) => {
            this.state.products = data;
        })
        // Или ошибку
        .catch(() => {
            alert('Error while JSON PUT');
        })
        .then(() => {
            this.render();
        })
        .catch(() => {
            alert('Error while render');
        });
    };

    // Смена поля сортировки
    toggleSortBy() {
        const { sortBy } = this.state;
        this.state.sortBy = sortBy === 'NAME' ? 'PRICE' : 'NAME';
    };

    // Смена порядка сортировки
    toggleSortOrder() {
        const { sortOrder } = this.state;
        this.state.sortOrder = sortOrder === 'DESC' ? 'ASC' : 'DESC';
    };

    // Обработка сортировки
    sortHandler = (event) => {
        const { type } = event.data;
        const { sortBy } = this.state;
        if (type === sortBy) {
            this.toggleSortOrder();
        } else {
            this.state.sortOrder = 'DESC';
            this.toggleSortBy();
        };
        this.render();
    };

    // Обработка поиска
    searchHandler = () => {
        this.state.status = "SORTING"
        this.inputs.search = $('#searchRequest').val();
        this.render();
    };

    // Обработка изменения/добавления товара
    editHandler = (event) => {
        this.state.status = "EDITING"
        const { product } = event.data;
        this.render(product);
    };

    // Обработка удаления товара
    deleteHandler = (event) => {
        this.state.status = "DELETING"
        const { product } = event.data;
        this.render(product);
    };

    // Удаление товара
    deleteProduct = (event) => {
        this.state.status = 'SORTING';
        const { toggleDeletion, product } = event.data;
        if (toggleDeletion === 'YES') {
            const { products } = this.state;
            // Удаляем выбранный товар из списка товаров
            _.remove(products, product);
            // Отправляем новый список на сервер
            this.putData();
        } else {
            this.render();
        }
    };

    // Изменение/создание товара
    editProduct = (event) => {
        this.state.status = 'SORTING';
        const { toggleSave, editableProduct } = event.data;
        if (toggleSave === 'YES') {
            const { products } = this.state;
            // Если получили null object, то клонируем его - создаем новый товар, иначе работаем с существующим товаром
            const product = editableProduct.id === null ? _.clone(editableProduct) : editableProduct;
            product.name = $('#inputProductName').val();
            product.email = $('#inputProductEmail').val();
            product.count = Number($('#inputProductCount').val());
            product.price = Number($('#inputProductPrice').val().slice(1));
            // Если новый продукт, то добавляем в массив товаров
            if (editableProduct.id === null) {
                // Будет пересечение id, но в коде никогда не происходит выборки по id. Скорее всего, уникальный id должн назначать сервер
                product.id = _.uniqueId();
                products.push(product);
            }
            // Отправляем новый список на сервер
            this.putData();
        } else {
            this.render();
        }
    };

    // Отрисовка шапки таблицы
    renderTableHead() {
        const tableHead = $('#tableHead')
        const { sortBy, sortOrder } = this.state;
        // Выбор имени стиля для отрисовки иконки сортировки
        const sortIcon = sortOrder === 'ASC' ? 'up-arrow' : 'down-arrow';
        // Заголовок столбца Name
        const nameEl = $('<th>').append(
            // Решаем, добавлять ли иконку сортировки
            $('<a>', { href: '#', class: `d-flex justify-content-between align-items-center ${sortBy === 'NAME' ? sortIcon : ''}` })
                .text('Name')
                .click({ type: 'NAME' }, this.sortHandler)
        );
        // Заголовок столбца Price
        const priceEl = $('<th>').append(
            // Решаем, добавлять ли иконку сортировки
            $('<a>', { href: '#', class: `d-flex justify-content-between align-items-center ${sortBy === 'PRICE' ? sortIcon : ''}` })
                .text('Price')
                .click({ type: 'PRICE' }, this.sortHandler)
        );
        // Заголовок столбца Actions
        const actionsEl = $('<th>', { class: 'pl-4' }).text('Actions');
        // Чистим старое, добавляем новое
        $(tableHead).empty();
        $('<tr>').append(
            $(nameEl),
            $(priceEl),
            $(actionsEl)
        ).appendTo(tableHead);
    };

    // Отрисовка тела таблицы
    renderTableBody() {
        const { sortBy, sortOrder, products } = this.state;
        const { search } = this.inputs;
        const tableBody = $('#tableBody');
        // Нормализуем поисковой запрос
        const searchStr = search.trim().toLowerCase();
        let searchedProducts = [];
        if (!searchStr == '') {
            // Товары, соответствующие поисковому запросу
            // Нормализуем название товара и ищем вхождение подстроки
            searchedProducts = products.filter((product) =>  product.name.trim().toLowerCase().includes(searchStr));
        } else {
            searchedProducts = products;
        };
        // Отсортированные товары
        const sortedProducts = _.orderBy(searchedProducts, sortBy.toLowerCase(), sortOrder.toLowerCase())
        // Чистим старое, добавляем новое
        $(tableBody).empty();
        sortedProducts.forEach((product) => {
            $('<tr>').append(
                // Столбец с названием и количеством товара
                $('<td>', { class: 'align-middle' }).append(
                    $('<div>', { class: 'd-flex justify-content-between' }).append(
                        $('<a>', { href: '#' })
                            .text(product.name)
                            .click({ product }, this.editHandler),
                        $('<span>', { class: 'product-count' })
                            .text(product.count),
                    )
                ),
                // Столбец с ценой товара
                $('<td>', { class: 'align-middle' })
                    .text(product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })),
                // Столбец с действиями
                $('<td>').append(
                    $('<button>', { class: "btn btn-primary mr-2 ml-2" })
                        .text('Edit')
                        .click({ product }, this.editHandler),
                    $('<button>', { class: "btn btn-secondary mr-2 ml-2" })
                        .text('Delete')
                        .click({ product }, this.deleteHandler),
                ),
            ).appendTo(tableBody);
        })
    };

    // Отрисовка модального окна удаления товара
    renderDeleteModal(product) {
        // Показываем модальное окно и бекдроп
        $('#backdrop').show();
        $('#deleteModal').show();
        $('#deletingProductName').text(product.name);
        // Удаляем старую и навешиваем новую подписку на событие
        $('#deleteYesButton').unbind().click({ toggleDeletion: 'YES', product }, this.deleteProduct);
        $('#deleteNoButton').unbind().click({ toggleDeletion: 'NO' }, this.deleteProduct);
    };

    // Отрисовка чекбоксов с городами
    renderCities(event, _country = null) {
        const { editableProduct } = event.data;
        const country =  _country ? _country : this.value;
        const cities = editableProduct.delivery[country];
        const checkboxes = $('#citiesCheckboxes').empty();
        _.keys(cities).forEach((city) => {
            $('<div>', { class: "form-check" }).append(
                $('<input>', { class: "form-check-input", type: "checkbox", id: `${city}Checkbox`, checked: editableProduct.delivery[country][city] }),
                $('<label>', { class: "form-check-label", for: `${city}Checkbox` }).text(city.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())),
            ).appendTo(checkboxes);
        });
        $('#selectAllCheckbox').prop('checked', false);
    };

    // Отрисовка модального окна изменения/добавления товара
    renderEditModal(product) {
        // Показываем модальное окно и бекдроп
        $('#backdrop').show();
        $('#editModal').show();
        // Находим изменяемый товар
        // Если его нет, значит это будет новый товар
        const editableProduct = product.id ? product : this.nullProduct;
        // Заполняем поля формы
        $('#editingProductName').text(editableProduct.name);
        $('#inputProductName').val(editableProduct.name);
        $('#inputProductEmail').val(editableProduct.email);
        $('#inputProductCount').val(editableProduct.count);
        $('#inputProductPrice').val(editableProduct.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
        // Удаляем старую и навешиваем новую подписку на событие
        $('#saveEditButton').unbind().click({ toggleSave: 'YES', editableProduct }, this.editProduct);
        $('#cancelEditButton').unbind().click({ toggleSave: 'NO' }, this.editProduct);
        // Чистим и заполняем список стран. При изменении селекта отрисовываем соответствующие города
        $('#countrySelect').empty().off().append(
            $('<option>', { value: 'russia' }).text('Russia'),
            $('<option>', { value: 'belarus' }).text('Belarus'),
            $('<option>', { value: 'usa' }).text('USA'),
        ).on('change', { editableProduct }, this.renderCities);
        // Селект и деселект всех городов
        $('#selectAllCheckbox').unbind().change(() => {
            $('#citiesCheckboxes input').each((i, checkbox) => $(checkbox).prop('checked', $('#selectAllCheckbox').prop('checked')))
        })
        // Отрисовываем города для селекта по умолчанию
        this.renderCities( { data: { editableProduct } }, $('#countrySelect').val() );
    };

    // Отрисовка приложения в зависимости от статуса
    render(product) {
        $('#backdrop').hide();
        $('#deleteModal').hide();
        $('#editModal').hide();
        $('#loading').hide();
        switch(this.state.status) {
            case 'SORTING': {
                this.renderTableHead();
                this.renderTableBody();
                break;
            }
            case 'EDITING': {
                this.renderEditModal(product);
                break;
            }
            case 'DELETING': {
                this.renderDeleteModal(product);
                break;
            }
            default: {
                alert('Unknown status');
                break;
            }
        }
    };
}

// Запускам приложение
$(document).ready(new App());
