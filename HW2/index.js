const state = {
    products: [],
    sortBy: 'NAME', //PRICE
    sortOrder: 'DESC', //ASC
};

(() => {
    const url = 'https://api.jsonbin.io/b/5e962adc5fa47104cea07c45/1';
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
    .then(() => render());
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

    const actionsEl = $('<th>').text('Actions');

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


