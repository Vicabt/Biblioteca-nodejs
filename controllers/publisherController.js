const dbConn = require('../lib/db');

const PublisherController = {
    // Listar editoriales
    async listPublishers(req, res) {
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
                `SELECT * FROM publishers ${where} ORDER BY name LIMIT ? OFFSET ?`,
                [...params, limit, offset]
            );

            const [countRows] = await dbConn.query(
                `SELECT COUNT(*) as total FROM publishers ${where}`,
                params
            );

            res.render('publishers/index', {
                title: 'Editoriales',
                publishers: rows,
                currentPage: page,
                totalPages: Math.ceil(countRows[0].total / limit),
                search,
                user: req.session.user || null,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined,
            });
        } catch (error) {
            console.error('Error al listar editoriales:', error);
            req.flash('error', 'Error al cargar la lista de editoriales');
            res.render('publishers/index', {
                title: 'Editoriales',
                publishers: [],
                currentPage: 1,
                totalPages: 1,
                search: '',
                user: req.session.user || null,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined,
            });
        }
    },

    // Mostrar editorial
    async showPublisher(req, res) {
        try {
            const [publisher] = await dbConn.query('SELECT * FROM publishers WHERE id_publisher = ?', [req.params.id]);
            
            if (!publisher[0]) {
                req.flash('error', 'Editorial no encontrada');
                return res.redirect('/publishers');
            }

            // Obtener libros de la editorial
            const [books] = await dbConn.query(
                `SELECT b.*, a.name as author_name, c.name as category_name 
                 FROM books b 
                 LEFT JOIN authors a ON b.id_author = a.id_author 
                 LEFT JOIN categories c ON b.id_category = c.id_category 
                 WHERE b.id_publisher = ? 
                 ORDER BY b.title`,
                [req.params.id]
            );

            res.render('publishers/show', {
                title: publisher[0].name,
                publisher: publisher[0],
                books,
                user: req.session.user || null,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined,
            });
        } catch (error) {
            console.error('Error al mostrar editorial:', error);
            req.flash('error', 'Error al cargar la editorial');
            res.redirect('/publishers');
        }
    },

    // Mostrar formulario de creación
    showCreateForm(req, res) {
        res.render('publishers/form', {
            title: 'Nueva Editorial',
            publisher: null,
            user: req.session.user
        });
    },

    // Crear editorial
    async createPublisher(req, res) {
        const { name, state } = req.body;

        try {
            if (!name) {
                req.flash('error', 'El nombre es obligatorio');
                return res.redirect('/publishers/new');
            }

            await dbConn.query(
                'INSERT INTO publishers (name, state) VALUES (?, ?)',
                [name, state || 1]
            );

            req.flash('success', 'Editorial creada exitosamente');
            res.redirect('/publishers');
        } catch (error) {
            console.error('Error al crear editorial:', error);
            req.flash('error', 'Error al crear la editorial');
            res.redirect('/publishers/new');
        }
    },

    // Mostrar formulario de edición
    async showEditForm(req, res) {
        try {
            const [publisher] = await dbConn.query('SELECT * FROM publishers WHERE id_publisher = ?', [req.params.id]);
            
            if (!publisher[0]) {
                req.flash('error', 'Editorial no encontrada');
                return res.redirect('/publishers');
            }

            res.render('publishers/form', {
                title: 'Editar Editorial',
                publisher: publisher[0],
                user: req.session.user
            });
        } catch (error) {
            console.error('Error al cargar formulario de edición:', error);
            req.flash('error', 'Error al cargar el formulario de edición');
            res.redirect('/publishers');
        }
    },

    // Actualizar editorial
    async updatePublisher(req, res) {
        const { name, state } = req.body;
        const id_publisher = req.params.id;

        try {
            if (!name) {
                req.flash('error', 'El nombre es obligatorio');
                return res.redirect(`/publishers/${id_publisher}/edit`);
            }

            await dbConn.query(
                'UPDATE publishers SET name = ?, state = ? WHERE id_publisher = ?',
                [name, state || 1, id_publisher]
            );

            req.flash('success', 'Editorial actualizada exitosamente');
            res.redirect('/publishers');
        } catch (error) {
            console.error('Error al actualizar editorial:', error);
            req.flash('error', 'Error al actualizar la editorial');
            res.redirect(`/publishers/${id_publisher}/edit`);
        }
    },

    // Eliminar editorial
    async deletePublisher(req, res) {
        try {
            // Verificar si la editorial tiene libros asociados
            const [books] = await dbConn.query('SELECT COUNT(*) as count FROM books WHERE id_publisher = ?', [req.params.id]);
            
            if (books[0].count > 0) {
                req.flash('error', 'No se puede eliminar la editorial porque tiene libros asociados');
                return res.redirect('/publishers');
            }

            await dbConn.query('DELETE FROM publishers WHERE id_publisher = ?', [req.params.id]);
            req.flash('success', 'Editorial eliminada exitosamente');
        } catch (error) {
            console.error('Error al eliminar editorial:', error);
            req.flash('error', 'Error al eliminar la editorial');
        }
        res.redirect('/publishers');
    }
};

module.exports = PublisherController; 