const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Rutas protegidas para administradores
router.get('/users', isAuthenticated, hasRole(['admin']), UserController.listUsers);
router.get('/users/new', isAuthenticated, hasRole(['admin']), UserController.showCreateForm);
router.post('/users', isAuthenticated, hasRole(['admin']), UserController.createUser);
router.get('/users/:id/edit', isAuthenticated, hasRole(['admin']), UserController.showEditForm);
router.post('/users/:id', isAuthenticated, hasRole(['admin']), UserController.updateUser);
router.post('/users/:id/toggle-status', isAuthenticated, hasRole(['admin']), UserController.toggleStatus);

module.exports = router;
