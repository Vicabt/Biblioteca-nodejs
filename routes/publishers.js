const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Listado de editoriales
router.get('/', isAuthenticated, async function(req, res) {
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
    const [rows] = await dbConn.query(`SELECT * FROM publishers ${where} ORDER BY name LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const [countRows] = await dbConn.query(`SELECT COUNT(*) as total FROM publishers ${where}`, params);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);
    res.render('publishers/index', { data: rows, page, totalPages, search });
  } catch (err) {
    req.flash('error', err.message || err);
    res.render('publishers/index', { data: [], page: 1, totalPages: 1, search: '' });
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

// Toggle publisher state (activate/deactivate)
router.post('/toggle-state/:id_publisher', async function(req, res) {
  const id_publisher = req.params.id_publisher;
  
  try {
    // Obtener estado actual
    const [publisherRows] = await dbConn.query('SELECT state FROM publishers WHERE id_publisher = ?', [id_publisher]);
    
    if (!publisherRows || publisherRows.length === 0) {
      req.flash('error', 'Editorial no encontrada');
      return res.redirect('/publishers/');
    }

    // Calcular el nuevo estado (1 -> 0, 0 -> 1)
    const currentState = publisherRows[0].state;
    const newState = currentState === 1 ? 0 : 1;
    
    // Actualizar el estado
    await dbConn.query('UPDATE publishers SET state = ? WHERE id_publisher = ?', [newState, id_publisher]);
    
    req.flash('success', `Editorial ${newState === 1 ? 'activada' : 'desactivada'} exitosamente`);
    
    // Redirigir a la misma página
    const referer = req.get('Referer');
    res.redirect(referer || '/publishers/');
  } catch (err) {
    req.flash('error', err.message || 'Error al cambiar el estado de la editorial');
    res.redirect('/publishers/');
  }
});

// Mostrar formulario de edición
router.get('/edit/:id_publisher', async function(req, res) {
  const id_publisher = req.params.id_publisher;
  
  try {
    const [rows] = await dbConn.query('SELECT * FROM publishers WHERE id_publisher = ?', [id_publisher]);
    
    if (!rows || rows.length === 0) {
      req.flash('error', 'Editorial no encontrada');
      return res.redirect('/publishers');
    }
    
    res.render('publishers/edit', {
      id_publisher: rows[0].id_publisher,
      name: rows[0].name,
      state: rows[0].state
    });
  } catch (err) {
    req.flash('error', err.message || err);
    res.redirect('/publishers');
  }
});

// Actualizar editorial
router.post('/update/:id_publisher', async function(req, res) {
  const id_publisher = req.params.id_publisher;
  let { name, state } = req.body;
  
  // Validación
  if (!name || name.trim() === '') {
    req.flash('error', 'El nombre es obligatorio.');
    return res.render('publishers/edit', { 
      id_publisher: id_publisher,
      name: name,
      state: state
    });
  }
  
  try {
    await dbConn.query('UPDATE publishers SET name = ?, state = ? WHERE id_publisher = ?', [name, state, id_publisher]);
    req.flash('success', 'Editorial actualizada exitosamente');
    res.redirect('/publishers');
  } catch (err) {
    req.flash('error', err.message || err);
    res.render('publishers/edit', { 
      id_publisher: id_publisher,
      name: name,
      state: state
    });
  }
});

module.exports = router;