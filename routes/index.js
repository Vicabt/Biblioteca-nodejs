const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const ProfileController = require('../controllers/profileController');

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

// Rutas del perfil del usuario
router.get('/profile', isAuthenticated, ProfileController.showProfile);
router.get('/profile/edit', isAuthenticated, ProfileController.showEditForm);
router.post('/profile/edit', isAuthenticated, ProfileController.updateProfile);
router.get('/profile/change-password', isAuthenticated, ProfileController.showChangePasswordForm);
router.post('/profile/change-password', isAuthenticated, ProfileController.changePassword);

module.exports = router;
