const state = {
    products: [
        { name: 'Product 1', count: 5, price: 1234.56 },
        { name: 'Product 2', count: 10, price: 7.91 },
        { name: 'Product 3', count: 7, price: 77.88 },
    ],
    sortBy: 'NAME', //PRICE
    sortOrder: 'DESC', //ASC
};

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

const deleteHandler = () => {

};

const renderTableHead = () => {
    const tableHead = $('#tableHead')
    const { sortBy, sortOrder } = state;

    const sortIcon = sortOrder === 'ASC' ? 'up-arrow' : 'down-arrow';
    const sortIcontEl = $('<div>', { class: sortIcon });

    const nameEl = $('<th>').append(
        $('<a>', { href: '#' })
            .text('Name')
            .click({ type: 'NAME' }, toggleSort)
    );

    const priceEl = $('<th>').append(
        $('<a>', { href: '#' })
            .text('Price')
            .click({ type: 'PRICE' }, toggleSort)
    );
    sortBy === 'NAME' ? nameEl.append(sortIcontEl) : priceEl.append(sortIcontEl);

    const actionsEl = $('<th>').append(
        $('<button>', { class: "btn btn-primary" })
            .text('Edit')
            .click(editHandler),
        $('<button>', { class: "btn btn-primary" })
            .text('Delete')
            .click(deleteHandler),
    );

    $(tableHead).empty();
    $('<tr>').append(
        $(nameEl),
        $(priceEl),
        $(actionsEl)
    ).appendTo(tableHead);
};

const renderTableBody = () => {
    
};

const render = () => {
    renderTableHead();
    renderTableBody();
};

render();
