const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    req.flash('error', 'Por favor inicie sesión para acceder a esta página');
    res.redirect('/auth/login');
};

const hasRole = (roles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.flash('error', 'Por favor inicie sesión para acceder a esta página');
            return res.redirect('/auth/login');
        }

        if (!roles.includes(req.session.user.role)) {
            req.flash('error', 'No tiene permisos para acceder a esta página');
            return res.status(403).render('error', { 
                message: 'Acceso denegado',
                error: { status: 403 }
            });
        }

        next();
    };
};

module.exports = {
    isAuthenticated,
    hasRole
}; 