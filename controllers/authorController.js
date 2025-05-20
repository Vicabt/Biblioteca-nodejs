const dbConn = require('../lib/db');

const AuthorController = {
    // Listar autores
    async listAuthors(req, res) {
        try {
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

            const [rows] = await dbConn.query(
                `SELECT * FROM authors ${where} ORDER BY name LIMIT ? OFFSET ?`,
                [...params, limit, offset]
            );

            const [countRows] = await dbConn.query(
                `SELECT COUNT(*) as total FROM authors ${where}`,
                params
            );            res.render('authors/index', {
                title: 'Autores',
                data: rows,
                page: page,
                totalPages: Math.ceil(countRows[0].total / limit),
                search,
                user: req.session.user || null,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined,
                messages: {
                    success: req.flash('success'),
                    error: req.flash('error')
                }
            });
        } catch (error) {
            console.error('Error al listar autores:', error);
            req.flash('error', 'Error al cargar la lista de autores');
            res.render('authors/index', {
                title: 'Autores',
                data: [],
                page: 1,
                totalPages: 1,
                search: '',
                user: req.session.user || null,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined,
            });
        }
    },

    // Mostrar autor
    async showAuthor(req, res) {
        try {
            const [author] = await dbConn.query('SELECT * FROM authors WHERE id_author = ?', [req.params.id]);
            
            if (!author[0]) {
                req.flash('error', 'Autor no encontrado');
                return res.redirect('/authors');
            }

            // Obtener libros del autor
            const [books] = await dbConn.query(
                `SELECT b.*, p.name as publisher_name, c.name as category_name 
                 FROM books b 
                 LEFT JOIN publishers p ON b.id_publisher = p.id_publisher 
                 LEFT JOIN categories c ON b.id_category = c.id_category 
                 WHERE b.id_author = ? 
                 ORDER BY b.title`,
                [req.params.id]
            );

            res.render('authors/show', {
                title: author[0].name,
                author: author[0],
                books,
                user: req.session.user || null,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined,
            });
        } catch (error) {
            console.error('Error al mostrar autor:', error);
            req.flash('error', 'Error al cargar el autor');
            res.redirect('/authors');
        }
    },

    // Mostrar formulario de creación
    showCreateForm(req, res) {
        res.render('authors/form', {
            title: 'Nuevo Autor',
            author: null,
            user: req.session.user
        });
    },

    // Crear autor
    async createAuthor(req, res) {
        const { name, state } = req.body;

        try {
            if (!name) {
                req.flash('error', 'El nombre es obligatorio');
                return res.redirect('/authors/new');
            }

            await dbConn.query(
                'INSERT INTO authors (name, state) VALUES (?, ?)',
                [name, state || 1]
            );

            req.flash('success', 'Autor creado exitosamente');
            res.redirect('/authors');
        } catch (error) {
            console.error('Error al crear autor:', error);
            req.flash('error', 'Error al crear el autor');
            res.redirect('/authors/new');
        }
    },

    // Mostrar formulario de edición
    async showEditForm(req, res) {
        try {
            const [author] = await dbConn.query('SELECT * FROM authors WHERE id_author = ?', [req.params.id]);
            
            if (!author[0]) {
                req.flash('error', 'Autor no encontrado');
                return res.redirect('/authors');
            }

            res.render('authors/form', {
                title: 'Editar Autor',
                author: author[0],
                user: req.session.user
            });
        } catch (error) {
            console.error('Error al cargar formulario de edición:', error);
            req.flash('error', 'Error al cargar el formulario de edición');
            res.redirect('/authors');
        }
    },

    // Actualizar autor
    async updateAuthor(req, res) {
        const { name, state } = req.body;
        const id_author = req.params.id;

        try {
            if (!name) {
                req.flash('error', 'El nombre es obligatorio');
                return res.redirect(`/authors/${id_author}/edit`);
            }

            await dbConn.query(
                'UPDATE authors SET name = ?, state = ? WHERE id_author = ?',
                [name, state || 1, id_author]
            );

            req.flash('success', 'Autor actualizado exitosamente');
            res.redirect('/authors');
        } catch (error) {
            console.error('Error al actualizar autor:', error);
            req.flash('error', 'Error al actualizar el autor');
            res.redirect(`/authors/${id_author}/edit`);
        }
    },

    // Eliminar autor
    async deleteAuthor(req, res) {
        try {
            // Verificar si el autor tiene libros asociados
            const [books] = await dbConn.query('SELECT COUNT(*) as count FROM books WHERE id_author = ?', [req.params.id]);
            
            if (books[0].count > 0) {
                req.flash('error', 'No se puede eliminar el autor porque tiene libros asociados');
                return res.redirect('/authors');
            }

            await dbConn.query('DELETE FROM authors WHERE id_author = ?', [req.params.id]);
            req.flash('success', 'Autor eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar autor:', error);            req.flash('error', 'Error al eliminar el autor');
        }
        res.redirect('/authors');
    },
    
    // Cambiar estado del autor (activar/desactivar)
    async toggleState(req, res) {
        try {
            const id_author = req.params.id_author;
            
            // Primero obtenemos el estado actual
            const [authorRows] = await dbConn.query('SELECT name, state FROM authors WHERE id_author = ?', [id_author]);
            
            if (!authorRows || authorRows.length === 0) {
                req.flash('error', 'Autor no encontrado');
                return res.redirect('/authors');
            }
            
            // Calculamos el nuevo estado (1 -> 0, 0 -> 1)
            const currentState = authorRows[0].state;
            const newState = currentState === 1 ? 0 : 1;
            const authorName = authorRows[0].name;
            
            // Actualizamos el estado
            await dbConn.query('UPDATE authors SET state = ? WHERE id_author = ?', [newState, id_author]);
            
            const message = newState === 1 
                ? `Autor "${authorName}" activado exitosamente` 
                : `Autor "${authorName}" desactivado exitosamente`;
                
            req.flash('success', message);
        } catch (error) {
            console.error('Error al cambiar el estado del autor:', error);
            req.flash('error', 'Error al cambiar el estado del autor');
        }
        res.redirect('/authors');
    }
};

module.exports = AuthorController;