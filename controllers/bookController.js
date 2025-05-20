const dbConn = require('../lib/db');

const BookController = {
    // Listar libros
    async listBooks(req, res) {
        try {
            console.log('Iniciando listado de libros...');
            console.log('Usuario en sesión:', req.session.user ? 'Autenticado' : 'No autenticado');
            
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;
            const search = req.query.search || '';
            
            let where = 'WHERE b.state = 1'; // Solo mostrar libros activos
            let params = [];
            
            if (search) {
                where += ' AND (b.name LIKE ? OR b.isbn LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            console.log('Ejecutando consulta SQL...');
            const query = `
                SELECT b.id_book, b.name, b.isbn, b.year_published, b.num_pages, b.state,
                       a.name as author_name, p.name as publisher_name, c.name as category_name 
                FROM books b 
                LEFT JOIN authors a ON b.id_author = a.id_author 
                LEFT JOIN publishers p ON b.id_publisher = p.id_publisher 
                LEFT JOIN categories c ON b.id_category = c.id_category 
                ${where} 
                ORDER BY b.name 
                LIMIT ? OFFSET ?
            `;
            console.log('Query:', query);
            console.log('Params:', [...params, limit, offset]);

            try {
                const [rows] = await dbConn.query(query, [...params, limit, offset]);
                console.log('Libros encontrados:', rows.length);

                const [countRows] = await dbConn.query(
                    `SELECT COUNT(*) as total FROM books b ${where}`,
                    params
                );
                console.log('Total de libros:', countRows[0].total);

                // Obtener categorías para el filtro
                const [categories] = await dbConn.query('SELECT * FROM categories WHERE state = 1 ORDER BY name');
                console.log('Categorías encontradas:', categories.length);

                res.render('books/index', {
                    title: 'Libros',
                    data: rows,
                    page: page,
                    totalPages: Math.ceil(countRows[0].total / limit),
                    search,
                    categories,
                    filterCategory: req.query.category || '',
                    user: req.session.user || null,
                    userName: req.session.user ? req.session.user.username : undefined,
                    userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined,
                    messages: {
                        success: req.flash('success'),
                        error: req.flash('error')
                    }
                });
            } catch (dbError) {
                console.error('Error en consulta a la base de datos:', dbError);
                throw dbError;
            }
        } catch (error) {
            console.error('Error detallado al listar libros:', error);
            req.flash('error', 'Error al cargar la lista de libros: ' + error.message);
            res.render('books/index', {
                title: 'Libros',
                data: [],
                page: 1,
                totalPages: 1,
                search: '',
                categories: [],
                filterCategory: '',
                user: req.session.user || null,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined,
                messages: {
                    success: req.flash('success'),
                    error: req.flash('error')
                }
            });
        }
    },

    // Buscar libros
    async searchBooks(req, res) {
        try {
            const search = req.query.q || '';
            const [rows] = await dbConn.query(
                `SELECT b.*, a.name as author_name, p.name as publisher_name, c.name as category_name 
                 FROM books b 
                 LEFT JOIN authors a ON b.id_author = a.id_author 
                 LEFT JOIN publishers p ON b.id_publisher = p.id_publisher 
                 LEFT JOIN categories c ON b.id_category = c.id_category 
                 WHERE b.name LIKE ? OR b.isbn LIKE ? OR a.name LIKE ? OR p.name LIKE ? OR c.name LIKE ?
                 ORDER BY b.name 
                 LIMIT 10`,
                [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
            );

            res.json(rows);
        } catch (error) {
            console.error('Error al buscar libros:', error);
            res.status(500).json({ error: 'Error al buscar libros' });
        }
    },

    // Mostrar libro
    async showBook(req, res) {
        try {
            const [rows] = await dbConn.query(
                `SELECT b.*, a.name as author_name, p.name as publisher_name, c.name as category_name 
                 FROM books b 
                 LEFT JOIN authors a ON b.id_author = a.id_author 
                 LEFT JOIN publishers p ON b.id_publisher = p.id_publisher 
                 LEFT JOIN categories c ON b.id_category = c.id_category 
                 WHERE b.id_book = ?`,
                [req.params.id]
            );

            if (!rows[0]) {
                req.flash('error', 'Libro no encontrado');
                return res.redirect('/books');
            }

            res.render('books/show', {
                title: rows[0].name,
                book: rows[0],
                user: req.session.user || null,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined
            });
        } catch (error) {
            console.error('Error al mostrar libro:', error);
            req.flash('error', 'Error al cargar el libro');
            res.redirect('/books');
        }
    },

    // Mostrar formulario de creación
    async showCreateForm(req, res) {
        try {
            console.log('Mostrando formulario de creación de libro...');
            console.log('Usuario en sesión:', req.session.user ? 'Autenticado' : 'No autenticado');
            
            if (!req.session.user) {
                req.flash('error', 'Debe iniciar sesión para acceder a esta página');
                return res.redirect('/auth/login');
            }

            if (!['admin', 'librarian'].includes(req.session.user.role)) {
                req.flash('error', 'No tiene permisos para acceder a esta página');
                return res.status(403).render('error', { 
                    message: 'Acceso denegado',
                    error: { status: 403 }
                });
            }

            const [authors] = await dbConn.query('SELECT * FROM authors WHERE state = 1 ORDER BY name');
            const [publishers] = await dbConn.query('SELECT * FROM publishers WHERE state = 1 ORDER BY name');
            const [categories] = await dbConn.query('SELECT * FROM categories WHERE state = 1 ORDER BY name');

            console.log('Datos cargados para el formulario:');
            console.log('- Autores:', authors.length);
            console.log('- Editoriales:', publishers.length);
            console.log('- Categorías:', categories.length);

            res.render('books/form', {
                title: 'Nuevo Libro',
                book: null,
                authors,
                publishers,
                categories,
                user: req.session.user,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined,
                messages: {
                    success: req.flash('success'),
                    error: req.flash('error')
                }
            });
        } catch (error) {
            console.error('Error al cargar formulario:', error);
            req.flash('error', 'Error al cargar el formulario: ' + error.message);
            res.redirect('/books');
        }
    },

    // Crear libro
    async createBook(req, res) {
        const { name, isbn, id_author, id_publisher, id_category, year_published, num_pages } = req.body;

        try {
            if (!name || !isbn) {
                req.flash('error', 'El título y el ISBN son obligatorios');
                return res.redirect('/books/new');
            }

            await dbConn.query(
                'INSERT INTO books (name, isbn, id_author, id_publisher, id_category, year_published, num_pages, state) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
                [name, isbn, id_author || null, id_publisher || null, id_category || null, year_published || null, num_pages || null]
            );

            req.flash('success', 'Libro creado exitosamente');
            res.redirect('/books');
        } catch (error) {
            console.error('Error al crear libro:', error);
            req.flash('error', 'Error al crear el libro: ' + error.message);
            res.redirect('/books/new');
        }
    },

    // Mostrar formulario de edición
    async showEditForm(req, res) {
        try {
            const [book] = await dbConn.query('SELECT * FROM books WHERE id_book = ?', [req.params.id]);
            const [authors] = await dbConn.query('SELECT * FROM authors WHERE state = 1 ORDER BY name');
            const [publishers] = await dbConn.query('SELECT * FROM publishers WHERE state = 1 ORDER BY name');
            const [categories] = await dbConn.query('SELECT * FROM categories WHERE state = 1 ORDER BY name');

            if (!book[0]) {
                req.flash('error', 'Libro no encontrado');
                return res.redirect('/books');
            }

            res.render('books/form', {
                title: 'Editar Libro',
                book: book[0],
                authors,
                publishers,
                categories,
                user: req.session.user,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined,
                messages: {
                    success: req.flash('success'),
                    error: req.flash('error')
                }
            });
        } catch (error) {
            console.error('Error al cargar formulario de edición:', error);
            req.flash('error', 'Error al cargar el formulario de edición');
            res.redirect('/books');
        }
    },

    // Actualizar libro
    async updateBook(req, res) {
        const { name, isbn, id_author, id_publisher, id_category, year_published, num_pages } = req.body;
        const id_book = req.params.id;

        try {
            if (!name || !isbn) {
                req.flash('error', 'El título y el ISBN son obligatorios');
                return res.redirect(`/books/${id_book}/edit`);
            }

            await dbConn.query(
                'UPDATE books SET name = ?, isbn = ?, id_author = ?, id_publisher = ?, id_category = ?, year_published = ?, num_pages = ? WHERE id_book = ?',
                [name, isbn, id_author || null, id_publisher || null, id_category || null, year_published || null, num_pages || null, id_book]
            );

            req.flash('success', 'Libro actualizado exitosamente');
            res.redirect('/books');
        } catch (error) {
            console.error('Error al actualizar libro:', error);
            req.flash('error', 'Error al actualizar el libro: ' + error.message);
            res.redirect(`/books/${id_book}/edit`);
        }
    },

    // Eliminar libro (cambiar estado a inactivo)
    async deleteBook(req, res) {
        try {
            await dbConn.query('UPDATE books SET state = 0 WHERE id_book = ?', [req.params.id]);
            req.flash('success', 'Libro eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar libro:', error);
            req.flash('error', 'Error al eliminar el libro: ' + error.message);
        }
        res.redirect('/books');
    },

    // Solicitar préstamo
    async requestLoan(req, res) {
        const id_book = req.params.id;
        const id_user = req.session.user.id_user;

        try {
            // Verificar si el libro está disponible
            const [book] = await dbConn.query('SELECT * FROM books WHERE id_book = ?', [id_book]);
            if (!book[0] || book[0].stock <= 0) {
                req.flash('error', 'El libro no está disponible para préstamo');
                return res.redirect(`/books/${id_book}`);
            }

            // Verificar si el usuario ya tiene un préstamo activo de este libro
            const [existingLoan] = await dbConn.query(
                'SELECT * FROM loans WHERE id_book = ? AND id_user = ? AND status IN ("requested", "approved")',
                [id_book, id_user]
            );

            if (existingLoan.length > 0) {
                req.flash('error', 'Ya tienes un préstamo activo o solicitado de este libro');
                return res.redirect(`/books/${id_book}`);
            }

            // Crear la solicitud de préstamo
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 15); // 15 días de préstamo

            await dbConn.query(
                'INSERT INTO loans (id_book, id_user, due_date, status) VALUES (?, ?, ?, "requested")',
                [id_book, id_user, dueDate]
            );

            req.flash('success', 'Solicitud de préstamo enviada exitosamente');
            res.redirect(`/books/${id_book}`);
        } catch (error) {
            console.error('Error al solicitar préstamo:', error);
            req.flash('error', 'Error al solicitar el préstamo');
            res.redirect(`/books/${id_book}`);
        }
    },

    // Restaurar libros inactivos
    async restoreBooks(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;
            const search = req.query.search || '';
            
            let where = 'WHERE b.state = 0';
            let params = [];
            
            if (search) {
                where += ' AND (b.name LIKE ? OR b.isbn LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            const [rows] = await dbConn.query(
                `SELECT b.*, a.name as author_name, p.name as publisher_name, c.name as category_name 
                 FROM books b 
                 LEFT JOIN authors a ON b.id_author = a.id_author 
                 LEFT JOIN publishers p ON b.id_publisher = p.id_publisher 
                 LEFT JOIN categories c ON b.id_category = c.id_category 
                 ${where} 
                 ORDER BY b.name 
                 LIMIT ? OFFSET ?`,
                [...params, limit, offset]
            );

            const [countRows] = await dbConn.query(
                `SELECT COUNT(*) as total FROM books b ${where}`,
                params
            );

            res.render('books/restore', {
                title: 'Restaurar Libros',
                data: rows,
                page: page,
                totalPages: Math.ceil(countRows[0].total / limit),
                search,
                user: req.session.user || null,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined
            });
        } catch (error) {
            console.error('Error al listar libros inactivos:', error);
            req.flash('error', 'Error al cargar la lista de libros inactivos');
            res.render('books/restore', {
                title: 'Restaurar Libros',
                data: [],
                page: 1,
                totalPages: 1,
                search: '',
                user: req.session.user || null,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined
            });
        }
    },    // Restaurar un libro específico
    async restoreBook(req, res) {
        try {
            await dbConn.query('UPDATE books SET state = 1 WHERE id_book = ?', [req.params.id]);
            req.flash('success', 'Libro restaurado exitosamente');
        } catch (error) {
            console.error('Error al restaurar libro:', error);
            req.flash('error', 'Error al restaurar el libro');
        }
        res.redirect('/books/restore');
    },
    
    // Desactivar un libro (cambiar estado a inactivo)
    async deactivateBook(req, res) {
        try {
            const id_book = req.body.id_book;
            
            if (!id_book) {
                req.flash('error', 'ID de libro no proporcionado');
                return res.redirect('/books');
            }
            
            // Primero obtenemos el nombre del libro para el mensaje de confirmación
            const [bookInfo] = await dbConn.query('SELECT name FROM books WHERE id_book = ?', [id_book]);
            const bookName = bookInfo && bookInfo.length > 0 ? bookInfo[0].name : 'Libro #' + id_book;
            
            await dbConn.query('UPDATE books SET state = 0 WHERE id_book = ?', [id_book]);
            req.flash('success', `Libro "${bookName}" desactivado exitosamente. Puede restaurarlo desde la sección de restauración.`);
        } catch (error) {
            console.error('Error al desactivar libro:', error);
            req.flash('error', 'Error al desactivar el libro: ' + error.message);
        }
        res.redirect('/books');
    }
};

module.exports = BookController;