// Состояние приложения:
// products - список товаров, 
// sortBy - сортировать по полю, 
// sortOrder - порядок сортировки, 
// status - статус приложения,
// search - строка поиска
const state = {
    products: [],
    sortBy: 'NAME',     // PRICE
    sortOrder: 'DESC',  // ASC
    status: 'SORTING',  // EDITING, DELETING
    search: '',
};

// IIFE для ajax запроса списка товаров
(loadData = () => {
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
        state.products = response;
    })
    .catch(() => {
        alert('Error while JSON loading');
    })
    // Если пришел ответ, то отрисовываем приложение
    .then(() => {
        render();
    })
    .catch(() => {
        alert('Error while render');
    });
})();

(inputsInit = () => {

})();

// Смена поля сортировки
const toggleSortBy = () => {
    const { sortBy } = state;
    state.sortBy = sortBy === 'NAME' ? 'PRICE' : 'NAME';
};

// Смена порядка сортировки
const toggleSortOrder = () => {
    const { sortOrder } = state;
    state.sortOrder = sortOrder === 'DESC' ? 'ASC' : 'DESC';
};

// Обработка сортировки
const sortHandler = (event) => {
    const { type } = event.data;
    const { sortBy } = state;

    if (type === sortBy) {
        toggleSortOrder();
    } else {
        state.sortOrder = 'DESC';
        toggleSortBy();
    };
    render();
}

// Обработка поиска
const searchHandler = () => {

};

// Обработка изменения/добавления товара
const editHandler = (e) => {
    state.status = "EDITING"
    const { id } = e.data;
    render(id);
};

// Обработка удаления товара
const deleteHandler = (e) => {
    state.status = "DELETING"
    const { id } = e.data;
    render(id);
};

// Отрисовка шапки таблицы
const renderTableHead = () => {
    const tableHead = $('#tableHead')
    const { sortBy, sortOrder } = state;
    // Выбор имени стиля для отрисовки иконки сортировки
    const sortIcon = sortOrder === 'ASC' ? 'up-arrow' : 'down-arrow';
    // Заголовок столбца Name
    const nameEl = $('<th>').append(
        // Решаем, добавлять ли иконку сортировки
        $('<a>', { href: '#', class: `d-flex justify-content-between align-items-center ${sortBy === 'NAME' ? sortIcon : ''}` })
            .text('Name')
            .click({ type: 'NAME' }, sortHandler)
    );
    // Заголовок столбца Price
    const priceEl = $('<th>').append(
        // Решаем, добавлять ли иконку сортировки
        $('<a>', { href: '#', class: `d-flex justify-content-between align-items-center ${sortBy === 'PRICE' ? sortIcon : ''}` })
            .text('Price')
            .click({ type: 'PRICE' }, sortHandler)
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
const renderTableBody = () => {
    const { sortBy, sortOrder, products, search } = state;
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
        })
    } else {
        searchedProducts = products;
    }
    // Отсортированные товары
    const sortedProducts = sortOrder === 'ASC' ? 
        _.sortBy(searchedProducts, sortBy.toLowerCase()) : 
        _.sortBy(searchedProducts, sortBy.toLowerCase()).reverse();
    // Чистим старое, добавляем новое
    $(tableBody).empty();
    sortedProducts.forEach((product) => {
        $('<tr>').append(
            // Столбце с названием и количеством товара
            $('<td>', { class: 'align-middle' }).append(
                $('<div>', { class: 'd-flex justify-content-between' }).append(
                    $('<a>', { href: '#' })
                        .text(product.name)
                        .click(editHandler),
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
                    .click({ id: product.id }, editHandler),
                $('<button>', { class: "btn btn-primary mr-2 ml-2" })
                    .text('Delete')
                    .click({ id: product.id }, deleteHandler),
            ),
        ).appendTo(tableBody);
    })
};

// Отрисовка модального окна удаления товара
const renderDeleteModal = (id) => {
    const { products } = state;
    // Показываем модальное окно и бекдроп
    $('#backdrop').removeClass('d-none');
    $('#deleteModal').show();
    // Находим удалаемый товар 
    const product = _.find(products, { id });
    $('#deletingProductName').text(product.name);

};

// Отрисовка модального окна изменения/добавления товара
const renderEditModal = (id) => {
    const { products } = state;
    // Показываем модальное окно и бекдроп
    $('#backdrop').removeClass('d-none');
    $('#editModal').show();
    // Находим изменяемый товар
    const product = _.find(products, { id });
    // Если его нет, значит это будет новый товар
    const headerText = product ? product.name : 'New product';
    $('#editingProductName').text(headerText);

};

// Отрисовка приложения в зависимости от статуса
const render = (id) => {
    switch(state.status) {
        case 'SORTING': {
            renderTableHead();
            renderTableBody();
            break;
        }
        case 'EDITING': {
            renderEditModal(id);
            break;
        }
        case 'DELETING': {
            renderDeleteModal(id);
            break;
        }
        default: {
            alert('Unknown status');
            break;
        }
    }
};
