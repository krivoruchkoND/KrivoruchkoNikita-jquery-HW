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

const searchHandler = () => {

};

const addNewHandler = () => {

};

const editHandler = () => {

};

const deleteHandler = () => {

};

const renderTableHead = () => {
    
};

const renderTableBody = () => {
    
};

const render = () => {
    renderTableHead();
    renderTableBody();
};

render();