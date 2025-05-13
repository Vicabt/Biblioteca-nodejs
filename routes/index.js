var express = require('express');
var router = express.Router();

// Redirigir la raíz al dashboard
router.get('/', function(req, res) {
  res.redirect('/dashboard');
});

// Dashboard principal
router.get('/dashboard', function(req, res) {
  res.render('index', {
    pageTitle: 'Panel de Control',
    // Puedes pasar aquí userName, appName, etc. si lo necesitas
  });
});

module.exports = router;
