const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Ruta pública
router.get('/', (req, res) => {
    res.render('index', { 
        title: 'Inicio',
        user: req.session.user || null
    });
});

// Rutas protegidas (requieren autenticación)
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', {
        title: 'Dashboard',
        user: req.session.user
    });
});

// Ruta para el perfil del usuario
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile/index', {
        title: 'Mi Perfil',
        user: req.session.user
    });
});

module.exports = router;
