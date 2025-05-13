var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');

console.log('El archivo authors.js se está ejecutando');

// Listado de autores
router.get('/', async function(req, res) {
  try {
    const [authors] = await dbConn.query('SELECT * FROM authors ORDER BY name');
    res.render('authors/index', { authors });
  } catch (err) {
    req.flash('error', err.message || err);
    res.render('authors/index', { authors: [] });
  }
});

// Formulario para agregar autor
router.get('/add', function(req, res) {
  res.render('authors/add', { name: '', state: 1 });
});

// Guardar nuevo autor
router.post('/add', async function(req, res) {
  let { name, state } = req.body;
  if (!name || name.trim() === '') {
    req.flash('error', 'El nombre es obligatorio.');
    return res.render('authors/add', { name, state });
  }
  try {
    await dbConn.query('INSERT INTO authors SET ?', { name, state });
    req.flash('success', 'Autor agregado exitosamente.');
    res.redirect('/authors');
  } catch (err) {
    req.flash('error', err.message || err);
    res.render('authors/add', { name, state });
  }
});

module.exports = router;