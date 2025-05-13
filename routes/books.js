var express = require('express');
var router = express.Router();
var dbConn  = require('../lib/db');

// display books page
router.get('/', async function(req, res, next) {
    try {
        const [rows] = await dbConn.query('SELECT * FROM books ORDER BY id_book DESC');
        res.render('books/index', { data: rows });
    } catch (err) {
        req.flash('error', err.message || err);
        res.render('books/index', { data: [] });
    }
});

// display add book page
router.get('/add', async function(req, res, next) {
    try {
        const [authors] = await dbConn.query('SELECT id_author, name FROM authors ORDER BY name');
        const [categories] = await dbConn.query('SELECT id_category, name FROM categories ORDER BY name');
        const [publishers] = await dbConn.query('SELECT id_publisher, name FROM publishers ORDER BY name');
        res.render('books/add', {
            authors: authors,
            categories: categories,
            publishers: publishers,
            name: '',
            isbn: '',
            year_published: '',
            num_pages: '',
            id_author: '',
            id_category: '',
            id_publisher: '',
            state: 1
        });
    } catch (err) {
        console.error('Error fetching data for add book page:', err);
        req.flash('error', err.message || 'Error al cargar los datos para la página de agregar libro.');
        res.render('books/add', { authors: [], categories: [], publishers: [], name: '', isbn: '', year_published: '', num_pages: '', id_author: '', id_category: '', id_publisher: '', state: 1 });
    }
});

// add a new book
router.post('/add', async function(req, res, next) {
    let { name, id_author, id_category, id_publisher, isbn, year_published, num_pages, state } = req.body;
    let errors = false;
    if (name.length === 0 || !id_author || !id_category || !id_publisher || !year_published) {
        errors = true;
        req.flash('error', "Por favor ingrese nombre, autor, categoría, editorial y año de publicación.");
        try {
            const [authors] = await dbConn.query('SELECT id_author, name FROM authors ORDER BY name');
            const [categories] = await dbConn.query('SELECT id_category, name FROM categories ORDER BY name');
            const [publishers] = await dbConn.query('SELECT id_publisher, name FROM publishers ORDER BY name');
            res.render('books/add', { authors, categories, publishers, name, isbn, year_published, num_pages, id_author, id_category, id_publisher, state });
        } catch (dbErr) {
            console.error('Error fetching data for add book page after validation error:', dbErr);
            req.flash('error', dbErr.message || 'Error al cargar datos después de un error de validación.');
            res.render('books/add', { authors: [], categories: [], publishers: [], name, isbn, year_published, num_pages, id_author, id_category, id_publisher, state });
        }
    } else {
        var form_data = { name, id_author, id_category, id_publisher, isbn, year_published, num_pages, state };
        dbConn.query('INSERT INTO books SET ?', form_data, async function(err, result) {
            if (err) {
                console.error('Error inserting book:', err);
                req.flash('error', err.message || 'Error al agregar el libro.');
                try {
                    const [authors] = await dbConn.query('SELECT id_author, name FROM authors ORDER BY name');
                    const [categories] = await dbConn.query('SELECT id_category, name FROM categories ORDER BY name');
                    const [publishers] = await dbConn.query('SELECT id_publisher, name FROM publishers ORDER BY name');
                    res.render('books/add', { authors, categories, publishers, ...form_data });
                } catch (dbErr) {
                    console.error('Error fetching data for add book page after insert error:', dbErr);
                    req.flash('error', dbErr.message || 'Error al recargar datos después de un error de inserción.');
                    res.render('books/add', { authors: [], categories: [], publishers: [], ...form_data });
                }
            } else {
                req.flash('success', 'Libro agregado exitosamente.');
                res.redirect('/books/');
            }
        });
    }
});

// display edit book page
router.get('/edit/:id_book', async function(req, res, next) {
    let id_book = req.params.id_book;
    try {
        const [bookRows] = await dbConn.query('SELECT * FROM books WHERE id_book = ?', [id_book]);
        const [authors] = await dbConn.query('SELECT id_author, name FROM authors ORDER BY name');
        const [categories] = await dbConn.query('SELECT id_category, name FROM categories ORDER BY name');
        const [publishers] = await dbConn.query('SELECT id_publisher, name FROM publishers ORDER BY name');
        if (!bookRows || bookRows.length === 0) {
            req.flash('error', 'Libro no encontrado con id_book = ' + id_book);
            res.redirect('/books/');
        } else {
            const book = bookRows[0];
            res.render('books/edit', {
                title: 'Editar Libro',
                id_book: book.id_book,
                name: book.name,
                isbn: book.isbn,
                year_published: book.year_published,
                num_pages: book.num_pages,
                id_author: book.id_author,
                id_category: book.id_category,
                id_publisher: book.id_publisher,
                state: book.state,
                authors: authors,
                categories: categories,
                publishers: publishers
            });
        }
    } catch (err) {
        console.error('Error fetching data for edit book page:', err);
        req.flash('error', err.message || 'Error al cargar los datos para editar el libro.');
        res.redirect('/books/');
    }
});

// update book data
router.post('/update/:id_book', async function(req, res, next) {
    let id_book = req.params.id_book;
    let { name, id_author, id_category, id_publisher, isbn, year_published, num_pages, state } = req.body;
    let errors = false;
    if (name.length === 0 || !id_author || !id_category || !id_publisher || !year_published) {
        errors = true;
        req.flash('error', "Por favor ingrese nombre, autor, categoría, editorial y año de publicación.");
        try {
            const [authors] = await dbConn.query('SELECT id_author, name FROM authors ORDER BY name');
            const [categories] = await dbConn.query('SELECT id_category, name FROM categories ORDER BY name');
            const [publishers] = await dbConn.query('SELECT id_publisher, name FROM publishers ORDER BY name');
            res.render('books/edit', { title: 'Editar Libro', id_book, name, isbn, year_published, num_pages, id_author, id_category, id_publisher, state, authors, categories, publishers });
        } catch (dbErr) {
            console.error('Error fetching data for edit book page after validation error:', dbErr);
            req.flash('error', dbErr.message || 'Error al cargar datos para editar después de un error de validación.');
            res.render('books/edit', { title: 'Editar Libro', id_book, name, isbn, year_published, num_pages, id_author, id_category, id_publisher, state, authors: [], categories: [], publishers: [] });
        }
    } else {
        var form_data = { name, id_author, id_category, id_publisher, isbn, year_published, num_pages, state };
        dbConn.query('UPDATE books SET ? WHERE id_book = ?', [form_data, id_book], async function(err, result) {
            if (err) {
                console.error('Error updating book:', err);
                req.flash('error', err.message || 'Error al actualizar el libro.');
                try {
                    const [authors] = await dbConn.query('SELECT id_author, name FROM authors ORDER BY name');
                    const [categories] = await dbConn.query('SELECT id_category, name FROM categories ORDER BY name');
                    const [publishers] = await dbConn.query('SELECT id_publisher, name FROM publishers ORDER BY name');
                    res.render('books/edit', { title: 'Editar Libro', id_book, ...form_data, authors, categories, publishers });
                } catch (dbErr) {
                    console.error('Error fetching data for edit book page after update error:', dbErr);
                    req.flash('error', dbErr.message || 'Error al recargar datos para editar después de un error de actualización.');
                    res.render('books/edit', { title: 'Editar Libro', id_book, ...form_data, authors: [], categories: [], publishers: [] });
                }
            } else {
                req.flash('success', 'Libro actualizado exitosamente.');
                res.redirect('/books/');
            }
        });
    }
});

// delete book
router.get('/delete/:id_book', async function(req, res, next) { // Made this async for consistency, though not strictly needed for delete if not fetching data after
    let id_book = req.params.id_book;
    try {
        await dbConn.query('DELETE FROM books WHERE id_book = ?', [id_book]);
        req.flash('success', 'Libro eliminado exitosamente. ID = ' + id_book);
    } catch (err) {
        console.error('Error deleting book:', err);
        req.flash('error', err.message || 'Error al eliminar el libro.');
    }
    res.redirect('/books/');
});

module.exports = router;