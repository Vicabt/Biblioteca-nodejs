const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Rutas específicas primero
router.post('/toggle-state/:id_category', isAuthenticated, hasRole(['admin', 'librarian']), CategoryController.toggleState);

// Rutas públicas
router.get('/', isAuthenticated, CategoryController.listCategories);
router.get('/:id', isAuthenticated, CategoryController.showCategory);

// Rutas de administración (requieren rol admin o bibliotecario)
router.get('/new', isAuthenticated, hasRole(['admin', 'librarian']), CategoryController.showCreateForm);
router.post('/', isAuthenticated, hasRole(['admin', 'librarian']), CategoryController.createCategory);
router.get('/:id/edit', isAuthenticated, hasRole(['admin', 'librarian']), CategoryController.showEditForm);
router.post('/:id', isAuthenticated, hasRole(['admin', 'librarian']), CategoryController.updateCategory);
router.post('/:id/delete', isAuthenticated, hasRole(['admin', 'librarian']), CategoryController.deleteCategory);

module.exports = router;