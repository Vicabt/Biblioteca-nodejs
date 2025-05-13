var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');

// Listado de editoriales
router.get('/', async function(req, res) {
  try {
    const [publishers] = await dbConn.query('SELECT * FROM publishers ORDER BY name');
    res.render('publishers/index', { publishers });
  } catch (err) {
    req.flash('error', err.message || err);
    res.render('publishers/index', { publishers: [] });
  }
});

// Formulario para agregar editorial
router.get('/add', function(req, res) {
  res.render('publishers/add', { name: '', state: 1 });
});

// Guardar nueva editorial
router.post('/add', async function(req, res) {
  let { name, state } = req.body;
  if (!name || name.trim() === '') {
    req.flash('error', 'El nombre es obligatorio.');
    return res.render('publishers/add', { name, state });
  }
  try {
    await dbConn.query('INSERT INTO publishers SET ?', { name, state });
    req.flash('success', 'Editorial agregada exitosamente.');
    res.redirect('/publishers');
  } catch (err) {
    req.flash('error', err.message || err);
    res.render('publishers/add', { name, state });
  }
});

module.exports = router;