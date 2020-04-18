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
        this.loadData();
    }

    // ajax запрос списка товаров
    loadData() {
        const url = 'https://api.jsonbin.io/b/5e962adc5fa47104cea07c45/2';
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
        const { products } = this.state;
        const { toggleDeletion, product } = event.data;
        toggleDeletion === 'YES' ? _.remove(products, product) : null;
        this.state.status = 'SORTING';
        this.render();
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
        const { sortBy, sortOrder, products, search } = this.state;
        const tableBody = $('#tableBody')
        // Нормализуем поисковой запрос
        const searchStr = search.trim().toLowerCase();
        let searchedProducts = [];
        if (!searchStr == '') {
            // Товары, соответствующие поисковому запросу
            searchedProducts = products.filter((product) => {
                // Нормализуем название товара
                const name = product.name.trim().toLowerCase();
                return name.startsWith(searchStr);
            });
        } else {
            searchedProducts = products;
        }
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
                    .text(Number(product.price)
                        .toLocaleString('en-US', { style: 'currency', currency: 'USD' })),
                // Столбец с действиями
                $('<td>').append(
                    $('<button>', { class: "btn btn-primary mr-2 ml-2" })
                        .text('Edit')
                        .click({ product }, this.editHandler),
                    $('<button>', { class: "btn btn-primary mr-2 ml-2" })
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

    // Отрисовка модального окна изменения/добавления товара
    renderEditModal(product) {
        // Показываем модальное окно и бекдроп
        $('#backdrop').show();
        $('#editModal').show();
        // Находим изменяемый товар
        // Если его нет, значит это будет новый товар
        const headerText = product ? product.name : 'New product';
        $('#editingProductName').text(headerText);
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
