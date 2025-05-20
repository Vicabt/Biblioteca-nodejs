var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');

console.log('El archivo authors.js se está ejecutando');

// Listado de autores
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
    const [rows] = await dbConn.query(`SELECT * FROM authors ${where} ORDER BY name LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const [countRows] = await dbConn.query(`SELECT COUNT(*) as total FROM authors ${where}`, params);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);
    res.render('authors/index', { data: rows, page, totalPages, search });
  } catch (err) {
    req.flash('error', err.message || err);
    res.render('authors/index', { data: [], page: 1, totalPages: 1, search: '' });
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

// Toggle author state (activate/deactivate)
router.post('/toggle-state/:id_author', async function(req, res) {
  const id_author = req.params.id_author;
  
  try {
    // Obtener estado actual
    const [authorRows] = await dbConn.query('SELECT state FROM authors WHERE id_author = ?', [id_author]);
    
    if (!authorRows || authorRows.length === 0) {
      req.flash('error', 'Autor no encontrado');
      return res.redirect('/authors/');
    }

    // Calcular el nuevo estado (1 -> 0, 0 -> 1)
    const currentState = authorRows[0].state;
    const newState = currentState === 1 ? 0 : 1;
    
    // Actualizar el estado
    await dbConn.query('UPDATE authors SET state = ? WHERE id_author = ?', [newState, id_author]);
    
    req.flash('success', `Autor ${newState === 1 ? 'activado' : 'desactivado'} exitosamente`);
    
    // Redirigir a la misma página
    const referer = req.get('Referer');
    res.redirect(referer || '/authors/');
  } catch (err) {
    req.flash('error', err.message || 'Error al cambiar el estado del autor');
    res.redirect('/authors/');
  }
});

// Mostrar formulario de edición
router.get('/edit/:id_author', async function(req, res) {
  const id_author = req.params.id_author;
  
  try {
    const [rows] = await dbConn.query('SELECT * FROM authors WHERE id_author = ?', [id_author]);
    
    if (!rows || rows.length === 0) {
      req.flash('error', 'Autor no encontrado');
      return res.redirect('/authors');
    }
    
    res.render('authors/edit', {
      id_author: rows[0].id_author,
      name: rows[0].name,
      state: rows[0].state
    });
  } catch (err) {
    req.flash('error', err.message || err);
    res.redirect('/authors');
  }
});

// Actualizar autor
router.post('/update/:id_author', async function(req, res) {
  const id_author = req.params.id_author;
  let { name, state } = req.body;
  
  // Validación
  if (!name || name.trim() === '') {
    req.flash('error', 'El nombre es obligatorio.');
    return res.render('authors/edit', { 
      id_author: id_author,
      name: name,
      state: state
    });
  }
  
  try {
    await dbConn.query('UPDATE authors SET name = ?, state = ? WHERE id_author = ?', [name, state, id_author]);
    req.flash('success', 'Autor actualizado exitosamente');
    res.redirect('/authors');
  } catch (err) {
    req.flash('error', err.message || err);
    res.render('authors/edit', { 
      id_author: id_author,
      name: name,
      state: state
    });
  }
});

module.exports = router;