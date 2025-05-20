const dbConn = require('../lib/db');

const CategoryController = {
    // Listar categorías
    async listCategories(req, res) {
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
                `SELECT * FROM categories ${where} ORDER BY name LIMIT ? OFFSET ?`,
                [...params, limit, offset]
            );

            const [countRows] = await dbConn.query(
                `SELECT COUNT(*) as total FROM categories ${where}`,
                params
            );            res.render('categories/index', {
                title: 'Categorías',
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
            console.error('Error al listar categorías:', error);
            req.flash('error', 'Error al cargar la lista de categorías');
            res.render('categories/index', {
                title: 'Categorías',
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

    // Mostrar categoría
    async showCategory(req, res) {
        try {
            const [category] = await dbConn.query('SELECT * FROM categories WHERE id_category = ?', [req.params.id]);
            
            if (!category[0]) {
                req.flash('error', 'Categoría no encontrada');
                return res.redirect('/categories');
            }

            // Obtener libros de la categoría
            const [books] = await dbConn.query(
                `SELECT b.*, a.name as author_name, p.name as publisher_name 
                 FROM books b 
                 LEFT JOIN authors a ON b.id_author = a.id_author 
                 LEFT JOIN publishers p ON b.id_publisher = p.id_publisher 
                 WHERE b.id_category = ? 
                 ORDER BY b.title`,
                [req.params.id]
            );

            res.render('categories/show', {
                title: category[0].name,
                category: category[0],
                books,
                user: req.session.user || null,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined,
            });
        } catch (error) {
            console.error('Error al mostrar categoría:', error);
            req.flash('error', 'Error al cargar la categoría');
            res.redirect('/categories');
        }
    },

    // Mostrar formulario de creación
    showCreateForm(req, res) {
        res.render('categories/form', {
            title: 'Nueva Categoría',
            category: null,
            user: req.session.user
        });
    },

    // Crear categoría
    async createCategory(req, res) {
        const { name, state } = req.body;

        try {
            if (!name) {
                req.flash('error', 'El nombre es obligatorio');
                return res.redirect('/categories/new');
            }

            await dbConn.query(
                'INSERT INTO categories (name, state) VALUES (?, ?)',
                [name, state || 1]
            );

            req.flash('success', 'Categoría creada exitosamente');
            res.redirect('/categories');
        } catch (error) {
            console.error('Error al crear categoría:', error);
            req.flash('error', 'Error al crear la categoría');
            res.redirect('/categories/new');
        }
    },

    // Mostrar formulario de edición
    async showEditForm(req, res) {
        try {
            const [category] = await dbConn.query('SELECT * FROM categories WHERE id_category = ?', [req.params.id]);
            
            if (!category[0]) {
                req.flash('error', 'Categoría no encontrada');
                return res.redirect('/categories');
            }

            res.render('categories/form', {
                title: 'Editar Categoría',
                category: category[0],
                user: req.session.user
            });
        } catch (error) {
            console.error('Error al cargar formulario de edición:', error);
            req.flash('error', 'Error al cargar el formulario de edición');
            res.redirect('/categories');
        }
    },

    // Actualizar categoría
    async updateCategory(req, res) {
        const { name, state } = req.body;
        const id_category = req.params.id;

        try {
            if (!name) {
                req.flash('error', 'El nombre es obligatorio');
                return res.redirect(`/categories/${id_category}/edit`);
            }

            await dbConn.query(
                'UPDATE categories SET name = ?, state = ? WHERE id_category = ?',
                [name, state || 1, id_category]
            );

            req.flash('success', 'Categoría actualizada exitosamente');
            res.redirect('/categories');
        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            req.flash('error', 'Error al actualizar la categoría');
            res.redirect(`/categories/${id_category}/edit`);
        }
    },

    // Eliminar categoría
    async deleteCategory(req, res) {
        try {
            // Verificar si la categoría tiene libros asociados
            const [books] = await dbConn.query('SELECT COUNT(*) as count FROM books WHERE id_category = ?', [req.params.id]);
            
            if (books[0].count > 0) {
                req.flash('error', 'No se puede eliminar la categoría porque tiene libros asociados');
                return res.redirect('/categories');
            }

            await dbConn.query('DELETE FROM categories WHERE id_category = ?', [req.params.id]);
            req.flash('success', 'Categoría eliminada exitosamente');
        } catch (error) {
            console.error('Error al eliminar categoría:', error);            req.flash('error', 'Error al eliminar la categoría');
        }
        res.redirect('/categories');
    },
    
    // Cambiar estado de la categoría (activar/desactivar)
    async toggleState(req, res) {
        try {
            const id_category = req.params.id_category;
            
            // Primero obtenemos el estado actual
            const [categoryRows] = await dbConn.query('SELECT name, state FROM categories WHERE id_category = ?', [id_category]);
            
            if (!categoryRows || categoryRows.length === 0) {
                req.flash('error', 'Categoría no encontrada');
                return res.redirect('/categories');
            }
            
            // Calculamos el nuevo estado (1 -> 0, 0 -> 1)
            const currentState = categoryRows[0].state;
            const newState = currentState === 1 ? 0 : 1;
            const categoryName = categoryRows[0].name;
            
            // Actualizamos el estado
            await dbConn.query('UPDATE categories SET state = ? WHERE id_category = ?', [newState, id_category]);
            
            const message = newState === 1 
                ? `Categoría "${categoryName}" activada exitosamente` 
                : `Categoría "${categoryName}" desactivada exitosamente`;
                
            req.flash('success', message);
        } catch (error) {
            console.error('Error al cambiar el estado de la categoría:', error);
            req.flash('error', 'Error al cambiar el estado de la categoría');
        }
        res.redirect('/categories');
    }
};

module.exports = CategoryController;