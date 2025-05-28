const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('express-flash');
const expressLayouts = require('express-ejs-layouts');

const indexRouter = require('./routes/index');
const booksRouter = require('./routes/books');
const authorsRouter = require('./routes/authors');
const publishersRouter = require('./routes/publishers');
const categoriesRouter = require('./routes/categories');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const loansRouter = require('./routes/loans');

const app = express();

// Configuración de sesiones
app.use(session({
    secret: 'tu_clave_secreta_aqui',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000 // 1 hora
    }
}));

// Configuración de flash messages
app.use(flash());

// Configuración de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para hacer disponible el usuario en todas las vistas
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    // Agregar req.originalUrl a res.locals para poder usarlo en las vistas
    res.locals.req = {
        originalUrl: req.originalUrl
    };
    
    // Debug de sesión
    if (req.path.includes('/loans')) {
        console.log('Sesión en ruta de préstamos:', req.path);
        console.log('Usuario en sesión:', req.session.user ? `ID: ${req.session.user.id_user}, Rol: ${req.session.user.role}` : 'No autenticado');
    }
    
    next();
});

// Middleware para manejar notificaciones
const notificationsMiddleware = require('./middleware/notifications');
app.use(notificationsMiddleware);

// Rutas
app.use('/', indexRouter);
app.use('/books', booksRouter);
app.use('/authors', authorsRouter);
app.use('/publishers', publishersRouter);
app.use('/categories', categoriesRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/loans', loansRouter); // Asegurar que esta línea esté presente y correcta

// Manejador de errores 404
app.use(function(req, res, next) {
    res.status(404).render('error', {
        message: 'Página no encontrada',
        error: { status: 404 }
    });
});

// Manejador de errores general
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(err.status || 500).render('error', {
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

module.exports = app;
