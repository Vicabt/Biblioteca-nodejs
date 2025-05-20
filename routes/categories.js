var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');

// Listado de categorías
router.get('/', async function(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  let where = 'WHERE 1=1';
  let params = [];
  if (search) {
    where += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  try {
    const [rows] = await dbConn.query(`SELECT * FROM categories ${where} ORDER BY name LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const [countRows] = await dbConn.query(`SELECT COUNT(*) as total FROM categories ${where}`, params);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);
    res.render('categories/index', { data: rows, page, totalPages, search });
  } catch (err) {
    req.flash('error', err.message || err);
    res.render('categories/index', { data: [], page: 1, totalPages: 1, search: '' });
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

// Toggle category state (activate/deactivate)
router.post('/toggle-state/:id_category', async function(req, res) {
  const id_category = req.params.id_category;
  
  try {
    // Obtener estado actual
    const [categoryRows] = await dbConn.query('SELECT state FROM categories WHERE id_category = ?', [id_category]);
    
    if (!categoryRows || categoryRows.length === 0) {
      req.flash('error', 'Categoría no encontrada');
      return res.redirect('/categories/');
    }

    // Calcular el nuevo estado (1 -> 0, 0 -> 1)
    const currentState = categoryRows[0].state;
    const newState = currentState === 1 ? 0 : 1;
    
    // Actualizar el estado
    await dbConn.query('UPDATE categories SET state = ? WHERE id_category = ?', [newState, id_category]);
    
    req.flash('success', `Categoría ${newState === 1 ? 'activada' : 'desactivada'} exitosamente`);
    
    // Redirigir a la misma página
    const referer = req.get('Referer');
    res.redirect(referer || '/categories/');
  } catch (err) {
    req.flash('error', err.message || 'Error al cambiar el estado de la categoría');
    res.redirect('/categories/');
  }
});

// Mostrar formulario de edición
router.get('/edit/:id_category', async function(req, res) {
  const id_category = req.params.id_category;
  
  try {
    const [rows] = await dbConn.query('SELECT * FROM categories WHERE id_category = ?', [id_category]);
    
    if (!rows || rows.length === 0) {
      req.flash('error', 'Categoría no encontrada');
      return res.redirect('/categories');
    }
    
    res.render('categories/edit', {
      id_category: rows[0].id_category,
      name: rows[0].name,
      state: rows[0].state
    });
  } catch (err) {
    req.flash('error', err.message || err);
    res.redirect('/categories');
  }
});

// Actualizar categoría
router.post('/update/:id_category', async function(req, res) {
  const id_category = req.params.id_category;
  let { name, state } = req.body;
  
  // Validación
  if (!name || name.trim() === '') {
    req.flash('error', 'El nombre es obligatorio.');
    return res.render('categories/edit', { 
      id_category: id_category,
      name: name,
      state: state
    });
  }
  
  try {
    await dbConn.query('UPDATE categories SET name = ?, state = ? WHERE id_category = ?', [name, state, id_category]);
    req.flash('success', 'Categoría actualizada exitosamente');
    res.redirect('/categories');
  } catch (err) {
    req.flash('error', err.message || err);
    res.render('categories/edit', { 
      id_category: id_category,
      name: name,
      state: state
    });
  }
});

module.exports = router;