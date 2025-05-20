const { isAuthenticated, hasRole } = require('./auth');

// Middleware para verificar si el usuario puede solicitar préstamos
const canRequestLoan = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'Por favor inicie sesión para solicitar un préstamo');
        return res.redirect('/auth/login');
    }

    if (req.session.user.status !== 'active') {
        req.flash('error', 'Su cuenta está inactiva. Contacte al administrador');
        return res.redirect('/');
    }

    next();
};

// Middleware para verificar si el usuario puede gestionar préstamos (admin o bibliotecario)
const canManageLoans = hasRole(['admin', 'librarian']);

// Middleware para verificar si el usuario puede ver sus propios préstamos
const canViewOwnLoans = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'Por favor inicie sesión para ver sus préstamos');
        return res.redirect('/auth/login');
    }

    // Si el usuario es admin o bibliotecario, puede ver todos los préstamos
    if (['admin', 'librarian'].includes(req.session.user.role)) {
        return next();
    }

    // Si no, solo puede ver sus propios préstamos
    if (req.params.id_user && parseInt(req.params.id_user) !== req.session.user.id_user) {
        req.flash('error', 'No tiene permisos para ver los préstamos de otros usuarios');
        return res.redirect('/');
    }

    next();
};

module.exports = {
    canRequestLoan,
    canManageLoans,
    canViewOwnLoans
}; 