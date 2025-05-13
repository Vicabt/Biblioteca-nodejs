var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');

// Listado de categorías
router.get('/', async function(req, res) {
  try {
    const [categories] = await dbConn.query('SELECT * FROM categories ORDER BY name');
    res.render('categories/index', { categories });
  } catch (err) {
    req.flash('error', err.message || err);
    res.render('categories/index', { categories: [] });
  }
});

// Formulario para agregar categoría
router.get('/add', function(req, res) {
  res.render('categories/add', { name: '', state: 1 });
});

// Guardar nueva categoría
router.post('/add', async function(req, res) {
  let { name, state } = req.body;
  if (!name || name.trim() === '') {
    req.flash('error', 'El nombre es obligatorio.');
    return res.render('categories/add', { name, state });
  }
  try {
    await dbConn.query('INSERT INTO categories SET ?', { name, state });
    req.flash('success', 'Categoría agregada exitosamente.');
    res.redirect('/categories');
  } catch (err) {
    req.flash('error', err.message || err);
    res.render('categories/add', { name, state });
  }
});

module.exports = router;