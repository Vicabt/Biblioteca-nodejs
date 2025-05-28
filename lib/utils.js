function formatDateForDb(date) {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    // const hours = d.getHours().toString().padStart(2, '0');
    // const minutes = d.getMinutes().toString().padStart(2, '0');
    // const seconds = d.getSeconds().toString().padStart(2, '0');
    // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return `${year}-${month}-${day}`;
}

function getPagination(page, size) {
    const limit = size ? +size : 10; // Número de registros por página
    const offset = page ? (page - 1) * limit : 0;
    return { limit, offset };
}

function calculateTotalPages(totalItems, limit) {
    return Math.ceil(totalItems / limit);
}

module.exports = {
    formatDateForDb,
    getPagination,
    calculateTotalPages
};