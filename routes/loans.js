// routes/loans.js
const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { isAuthenticated, hasRole } = require('../middleware/auth'); // Corregir el nombre de la función importada de authorizeRoles a hasRole

// Mostrar formulario para nuevo préstamo
router.get('/new', isAuthenticated, hasRole(['admin', 'librarian']), loanController.showNewLoanForm);

// Crear un nuevo préstamo
router.post('/', isAuthenticated, hasRole(['admin', 'librarian']), loanController.createLoan);

// Listar todos los préstamos (para admin/librarian)
router.get('/', isAuthenticated, hasRole(['admin', 'librarian']), loanController.listAllLoans);

// Marcar un préstamo como devuelto
router.post('/:id_loan/return', isAuthenticated, hasRole(['admin', 'librarian']), loanController.markAsReturned);

// Listar préstamos del usuario autenticado
router.get('/my-loans', isAuthenticated, hasRole(['user', 'admin', 'librarian']), loanController.listMyLoans);

// Renovar un préstamo
router.get('/:id_loan/renew', isAuthenticated, hasRole(['user', 'admin', 'librarian']), loanController.renewLoan);

module.exports = router;
