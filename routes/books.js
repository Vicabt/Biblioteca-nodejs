const express = require('express');
const router = express.Router();
const BookController = require('../controllers/bookController');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const { canRequestLoan } = require('../middleware/loanAuth');
const methodOverride = require('method-override');

// Habilitar method-override para métodos HTTP personalizados
router.use(methodOverride('_method'));

// Rutas de administración (requieren rol admin o bibliotecario)
router.get('/new', isAuthenticated, hasRole(['admin', 'librarian']), BookController.showCreateForm);
router.get('/restore', isAuthenticated, hasRole(['admin', 'librarian']), BookController.restoreBooks);
router.post('/restore/:id', isAuthenticated, hasRole(['admin', 'librarian']), BookController.restoreBook);
router.post('/deactivate', isAuthenticated, hasRole(['admin', 'librarian']), BookController.deactivateBook);

// Rutas públicas protegidas (requieren autenticación)
router.get('/search', isAuthenticated, BookController.searchBooks);
router.post('/:id/request-loan', isAuthenticated, canRequestLoan, BookController.requestLoan);

// Rutas de administración (requieren rol admin o bibliotecario)
router.post('/', isAuthenticated, hasRole(['admin', 'librarian']), BookController.createBook);
router.get('/:id/edit', isAuthenticated, hasRole(['admin', 'librarian']), BookController.showEditForm);
router.post('/:id', isAuthenticated, hasRole(['admin', 'librarian']), BookController.updateBook);
router.delete('/:id', isAuthenticated, hasRole(['admin', 'librarian']), BookController.deleteBook);

// Rutas públicas protegidas (requieren autenticación) que deben ir al final
router.get('/:id', isAuthenticated, BookController.showBook);
router.get('/', isAuthenticated, BookController.listBooks);

module.exports = router;