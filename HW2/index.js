class App {
    constructor() {
        // Состояние приложения:
        // products - список товаров, 
        // sortBy - сортировать по полю, 
        // sortOrder - порядок сортировки, 
        // status - статус приложения,
        // search - строка поиска
        this.state = {
            products: [],
            sortBy: 'NAME',     // PRICE
            sortOrder: 'DESC',  // ASC
            status: 'SORTING',  // EDITING, DELETING
            search: '',
        };
        $('#searchButton').click(this.searchHandler);
        $('#addNewButton').click({ product: this.nullProduct }, this.editHandler);
        this.loadData();
    }

    // Null object pattern для товара
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
            }
    };

    // ajax запрос списка товаров
    loadData() {
        const url = 'https://api.jsonbin.io/b/5e962adc5fa47104cea07c45/8';
        const key = '$2b$10$ltjATMhqY0JfYN5Mi1k1nOVTEQIGJwabv1R6Fb9CUjOUl7jTe6PwG';
        $.ajax({
            type: 'GET',
            headers: {
                'secret-key': key,
            },
            url,
        })
        .then((response) => {
            this.state.products = response;
        })
        .catch(() => {
            alert('Error while JSON loading');
        })
        // Если пришел ответ, то отрисовываем приложение
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
    }

    // Обработка поиска
    searchHandler = (event) => {
        this.state.status = "SORTING"
        this.state.search = $('#searchRequest').val();
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
        const { products } = this.state;
        const { toggleDeletion, product } = event.data;
        toggleDeletion === 'YES' ? _.remove(products, product) : null;
        this.render();
    };

    // Изменение/создание товара
    editProduct = (event) => {
        this.state.status = 'SORTING';
        const { toggleSave, editableProduct } = event.data;
        // Если нажали отмену, то рендер таблицы
        if (toggleSave === 'NO') {
            return this.render();
        };
        // Если получили null object, то клонируем его - создаем новый товар, иначе работаем с существующим товаром
        const product = editableProduct.id === null ? _.clone(editableProduct) : editableProduct;
        // Обычно id сущностям присваивают на серверной стороне, поэтому тут это выглядит так нелепо
        product.id = 1000 + _.uniqueId();
        product.name = $('#inputProductName').val();
        product.email = $('#inputProductEmail').val();
        product.count = Number($('#inputProductCount').val());
        product.price = Number($('#inputProductPrice').val());
        // Если новый продукт, то добавляем в массив товаров
        if (editableProduct.id === null) {
            this.state.products.push(product);
        }
        this.render();
    }

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
        const { sortBy, sortOrder, products, search } = this.state;
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
                // Столбце с названием и количеством товара
                $('<td>', { class: 'align-middle' }).append(
                    $('<div>', { class: 'd-flex justify-content-between' }).append(
                        $('<a>', { href: '#' })
                            .text(product.name)
                            .click(this.editHandler),
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
        // Находим удалаемый товар 
        $('#deletingProductName').text(product.name);
        $('#deleteYesButton').click({ toggleDeletion: 'YES', product }, this.deleteProduct);
        $('#deleteNoButton').click({ toggleDeletion: 'NO' }, this.deleteProduct);
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
        $('#inputProductPrice').val(Number(editableProduct.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
        $('#saveEditButton').click({ toggleSave: 'YES', editableProduct }, this.editProduct);
        $('#cancelEditButton').click({ toggleSave: 'NO' }, this.editProduct);
        // Чистим и заполняем список стран. При изменении селекта отрисовываем соответствующие города
        $('#countrySelect').empty().append(
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

// Запускам приложение после парсинга HTML
$(document).ready(new App());
