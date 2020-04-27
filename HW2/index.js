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
            binVersion: '21',  // На всякий случай по умолчанию всегда загружается заведомо правильный JSON
            key: '$2b$10$ltjATMhqY0JfYN5Mi1k1nOVTEQIGJwabv1R6Fb9CUjOUl7jTe6PwG',
        };
        // Входные данные - строго контролировать нужно только количество и цену
        this.inputs = {
            count: 0,
            price: 0,
            search: '',
        };
        // Навешиваем обработчики на кнопки и загружаем данные
        this.inputsInit();
        this.getData();
    };

    // Null object товара
    nullProduct = {
        id: null,
        name: 'New Product',
        email: 'Supplier Email',
        count: 0,
        price: 0,
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
        $('#searchButton').on('click', this.searchHandler);
        $('#addNewButton').on('click', { product: this.nullProduct }, this.editHandler);
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
            this.JSONBin.binVersion = 'latest'; // Смена версии JSON, для подгрузки новых данных
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

    // Валидация инпутов
    checkValidation = (product) => {
        const validation = {};
        validation.name = /^([a-zA-Z0-9\s_-]){5,15}$/.test(product.name);
        validation.email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(product.email);
        validation.count = /([0-9])$/.test(product.count) && product.count > 0;
        validation.price = /([0-9])$/.test(product.price) && product.price > 0;
        return validation;
    };

    // Изменение/создание товара
    editProduct = (event) => {
        this.state.status = 'SORTING';
        const { toggleSave, editableProduct } = event.data;
        if (toggleSave === 'YES') {
            const { products } = this.state;
            editableProduct.name = $('#inputProductName').val();
            editableProduct.email = $('#inputProductEmail').val();
            editableProduct.count = Number($('#inputProductCount').val());
            editableProduct.price = Number($('#inputProductPrice').val().match(/[0-9.]/gm).join(''));
            
            // TO DO Перенести в данную функцию сбор данныех с чекбоксов. Это должно происходить только при сохранении продукта, не при его редактировании

            // Если новый продукт, то добавляем в массив товаров
            if (editableProduct.id === null) {
                // Будет пересечение id, но в коде никогда не происходит выборки по id. Скорее всего, уникальный id должн назначать сервер
                editableProduct.id = _.uniqueId();
                products.push(editableProduct);
            }
            const validation = this.checkValidation(editableProduct);
            // Проверяме, все ли поля валидны
            if (!Object.keys(validation).some((prop) => !validation[prop])) {
                // Отправляем новый список на сервер
                this.putData();
            } else {
                this.renderErrors(validation);
            }
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
        const createHeder = (str) => {
            return $('<th>').append(
                $('<a>', { href: '#', class: `d-flex justify-content-between align-items-center ${sortBy === str ? sortIcon : ''}` })
                    .text(_.capitalize(str))
                    .on('click',{ type: str }, this.sortHandler)
            );
        }
        // Заголовок столбца Name
        const nameEl = createHeder('NAME');
        // Заголовок столбца Price
        const priceEl = createHeder('PRICE');
        // Заголовок столбца Actions
        const actionsEl = $('<th>', { class: 'pl-4' }).text('Actions');
        // Чистим старое, добавляем новое
        $(tableHead).empty().append(
            $('<tr>').append(
                $(nameEl),
                $(priceEl),
                $(actionsEl),
            ),
        );
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
            $(tableBody).append(
                $('<tr>').append(
                    // Столбец с названием и количеством товара
                    $('<td>', { class: 'align-middle' }).append(
                        $('<div>', { class: 'd-flex justify-content-between' }).append(
                            $('<a>', { href: '#' })
                                .text(product.name)
                                .on('click', { product }, this.editHandler),
                            $('<span>', { class: 'product-count' })
                                .text(product.count),
                        ),
                    ),
                    // Столбец с ценой товара
                    $('<td>', { class: 'align-middle' })
                        .text(product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })),
                    // Столбец с действиями
                    $('<td>').append(
                        $('<button>', { class: "btn btn-primary mr-2 ml-2" })
                            .text('Edit')
                            .on('click', { product }, this.editHandler),
                        $('<button>', { class: "btn btn-secondary mr-2 ml-2" })
                            .text('Delete')
                            .on('click', { product }, this.deleteHandler),
                    ),
                ),
            )
        })
    };

    // Отрисовка модального окна удаления товара
    renderDeleteModal(product) {
        // Показываем модальное окно и бекдроп
        $('#backdrop').show();
        $('#deleteModal').show();
        $('#deletingProductName').text(product.name);
        // Удаляем старую и навешиваем новую подписку на событие
        $('#deleteYesButton').off().on('click', { toggleDeletion: 'YES', product }, this.deleteProduct);
        $('#deleteNoButton').off().on('click', { toggleDeletion: 'NO' }, this.deleteProduct);
    };

    // Отрисовка чекбоксов с городами
    renderCities(event, _country = null) {
        const { editableProduct } = event.data;
        const country =  _country ? _country : this.value;
        const cities = editableProduct.delivery[country];
        const checkboxes = $('#citiesCheckboxes').empty();
        // Рисуем для каждого города чекбокс с подписью и подписываем его на событие

        // TO DO Выяснить, почему при работе с новый объектом данные с чекбоксов записываются и в nullProduct, а не только в его клон

        _.keys(cities).forEach((city) => {
            $(checkboxes).append(
                $('<div>', { class: "form-check" }).append(
                    $('<input>', { class: "form-check-input", type: "checkbox", id: `${city}Checkbox`, checked: editableProduct.delivery[country][city] })
                        .off()
                        .on('change', function() {
                            editableProduct.delivery[country][city] = $(this).prop('checked');
                        }),
                    $('<label>', { class: "form-check-label", for: `${city}Checkbox` }).text(city.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())),
                ),
            )
        });
        // Селект и деселект всех городов
        $('#selectAllCheckbox').prop('checked', false);
        $('#selectAllCheckbox').off().on('change', () => {
            $('#citiesCheckboxes input').each((i, checkbox) => {
                $(checkbox).prop('checked', $('#selectAllCheckbox').prop('checked'));
                editableProduct.delivery[country] = _.mapValues(editableProduct.delivery[country], () => $('#selectAllCheckbox').prop('checked'));
            });
        });
    };

    // Отрисовка ошибок валидации
    renderErrors(validation) {
        const fields = Object.keys(validation);
        fields.forEach((field) => {
            validation[field] ? $(`#${field}Help`).removeClass('invalid').addClass('valid') : $(`#${field}Help`).removeClass('valid').addClass('invalid');
        });
    };

    // Отрисовка модального окна изменения/добавления товара
    renderEditModal(product) {
        // Показываем модальное окно и бекдроп
        $('#backdrop').show();
        $('#editModal').show();

        // TO DO Добавить сброс классов valid и invalid

        // Находим изменяемый товар
        // Если его нет, значит это будет новый товар
        const editableProduct = product.id ? product : _.clone(this.nullProduct);
        // Заполняем поля формы
        $('#editingProductName').text(editableProduct.name);
        $('#inputProductName').val(editableProduct.name);
        $('#inputProductEmail').val(editableProduct.email);
        // Валидация заполнения количества
        $('#inputProductCount')
            .val(editableProduct.count)
            .on('input', function() {
                $(this).val($(this).val().replace(/[^\d\.]/g, ''));
                editableProduct.count = Number($(this).val());
            });
        // Валидация заполнения цены
        $('#inputProductPrice')
            .val(editableProduct.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }))
            .on('focus', function() {$(this).val(editableProduct.price)})
            .on('focusout', function() {$(this).val(editableProduct.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }))})
            .on('input', function() {
                $(this).val($(this).val().replace(/[^\d\.]/g, ''));
                editableProduct.price = Number($(this).val());
            });
        // Удаляем старую и навешиваем новую подписку на событие
        $('#saveEditButton').off().on('click', { toggleSave: 'YES', editableProduct }, this.editProduct);
        $('#cancelEditButton').off().on('click', { toggleSave: 'NO' }, this.editProduct);
        // Чистим и заполняем список стран. При изменении селекта отрисовываем соответствующие города
        $('#countrySelect').empty().off().append(
            $('<option>', { value: 'russia' }).text('Russia'),
            $('<option>', { value: 'belarus' }).text('Belarus'),
            $('<option>', { value: 'usa' }).text('USA'),
        ).on('change', { editableProduct }, this.renderCities);
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
