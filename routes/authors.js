const express = require('express');
const router = express.Router();
const AuthorController = require('../controllers/authorController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

console.log('El archivo authors.js se está ejecutando');

// Rutas específicas primero
router.post('/toggle-state/:id_author', isAuthenticated, hasRole(['admin', 'librarian']), AuthorController.toggleState);

// Rutas de administración (requieren rol admin o bibliotecario)
router.get('/new', isAuthenticated, hasRole(['admin', 'librarian']), AuthorController.showCreateForm);
router.get('/:id/edit', isAuthenticated, hasRole(['admin', 'librarian']), AuthorController.showEditForm);

// Rutas públicas
router.get('/:id', isAuthenticated, AuthorController.showAuthor);
router.get('/', isAuthenticated, AuthorController.listAuthors);

// Rutas de administración (requieren rol admin o bibliotecario)
router.post('/', isAuthenticated, hasRole(['admin', 'librarian']), AuthorController.createAuthor);
router.post('/:id', isAuthenticated, hasRole(['admin', 'librarian']), AuthorController.updateAuthor);
router.post('/:id/delete', isAuthenticated, hasRole(['admin', 'librarian']), AuthorController.deleteAuthor);

module.exports = router;