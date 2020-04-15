const state = {
    products: [],
    sortBy: 'NAME', //PRICE
    sortOrder: 'DESC', //ASC
};

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
    .then(() => {
        render();
    })
    .catch(() => {
        alert('Error while render');
    });
})();

(inputsInit = () => {

})();

const toggleSortBy = () => {
    const { sortBy } = state;
    state.sortBy = sortBy === 'NAME' ? 'PRICE' : 'NAME';
};

const toggleSortOrder = () => {
    const { sortOrder } = state;
    state.sortOrder = sortOrder === 'DESC' ? 'ASC' : 'DESC';
};

const toggleSort = (event) => {
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

const searchHandler = () => {

};

const addNewHandler = () => {

};

const editHandler = () => {

};

const deleteHandler = (e) => {

};

const renderTableHead = () => {
    const tableHead = $('#tableHead')
    const { sortBy, sortOrder } = state;

    const sortIcon = sortOrder === 'ASC' ? 'up-arrow' : 'down-arrow';

    const nameEl = $('<th>').append(
        $('<a>', { href: '#', class: `d-flex justify-content-between align-items-center ${sortBy === 'NAME' ? sortIcon : ''}` })
            .text('Name')
            .click({ type: 'NAME' }, toggleSort)
    );

    const priceEl = $('<th>').append(
        $('<a>', { href: '#', class: `d-flex justify-content-between align-items-center ${sortBy === 'PRICE' ? sortIcon : ''}` })
            .text('Price')
            .click({ type: 'PRICE' }, toggleSort)
    );

    const actionsEl = $('<th>', { class: 'pl-4' }).text('Actions');

    $(tableHead).empty();
    $('<tr>').append(
        $(nameEl),
        $(priceEl),
        $(actionsEl)
    ).appendTo(tableHead);
};

const renderTableBody = () => {
    const { sortBy, sortOrder, products } = state;
    const tableBody = $('#tableBody')
    // for some reason _.orderBy is not a function
    const sortedProducts = sortOrder === 'ASC' ? 
        _.sortBy(products, sortBy.toLowerCase()) : 
        _.sortBy(products, sortBy.toLowerCase()).reverse();
    $(tableBody).empty();
    sortedProducts.forEach((product) => {
        $('<tr>').append(
            $('<td>', { class: 'align-middle' }).append(
                $('<div>', { class: 'd-flex justify-content-between' }).append(
                    $('<a>', { href: '#' })
                        .text(product.name)
                        .click(editHandler),
                    $('<span>', { class: 'product-count' })
                        .text(product.count),
                )
            ),
            $('<td>', { class: 'align-middle' })
                .text(Number(product.price)
                    .toLocaleString('en-US', { style: 'currency', currency: 'USD' })),
            $('<td>').append(
                $('<button>', { class: "btn btn-primary mr-2 ml-2" })
                    .text('Edit')
                    .click(editHandler),
                $('<button>', { class: "btn btn-primary mr-2 ml-2" })
                    .text('Delete')
                    .click(deleteHandler),
            ),
        ).appendTo(tableBody);
    })
};

const render = () => {
    renderTableHead();
    renderTableBody();
};
