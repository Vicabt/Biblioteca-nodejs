// controllers/loanController.js
const db = require('../lib/db');
const { formatDateForDb } = require('../lib/utils'); // Assuming you have a utils file for date formatting

const LoanController = {    // Mostrar formulario para crear un nuevo préstamo
    showNewLoanForm: async (req, res) => {
        try {
            const [books] = await db.query("SELECT id_book, name as title, isbn FROM books WHERE state = 1 ORDER BY name ASC");
            const [users] = await db.query("SELECT id_user, username, email FROM users WHERE role = 'user' AND status = 'active' ORDER BY username ASC");

            res.render('loans/new', {
                title: 'Registrar Nuevo Préstamo',
                pageTitle: 'Registrar Nuevo Préstamo',
                books,
                users,
                messages: {
                    error: req.flash('error'),
                    success: req.flash('success')
                },
                formData: req.flash('formData')[0] || {}
            });
        } catch (error) {
            console.error('Error fetching data for new loan form:', error);
            req.flash('error', 'Error al cargar el formulario de préstamos.');
            res.redirect('/'); // Or an appropriate error page
        }
    },

    // Crear un nuevo préstamo
    createLoan: async (req, res) => {
        const { id_book, id_user, due_date_str } = req.body;

        if (!id_book || !id_user || !due_date_str) {
            req.flash('error', 'Todos los campos son obligatorios.');
            req.flash('formData', req.body);
            return res.redirect('/loans/new');
        }

        const dueDate = new Date(due_date_str);
        const today = new Date();
        today.setHours(0,0,0,0); // Compare dates only

        if (isNaN(dueDate.getTime()) || dueDate <= today) {
            req.flash('error', 'La fecha de devolución debe ser una fecha futura válida.');
            req.flash('formData', req.body);
            return res.redirect('/loans/new');
        }
        
        const formattedDueDate = formatDateForDb(dueDate);

        // Using a connection for potential transaction
        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();            // 1. Verificar libro
            const [books] = await connection.query("SELECT name FROM books WHERE id_book = ? AND state = 1", [id_book]);
            if (books.length === 0) {
                await connection.rollback();
                req.flash('error', 'Libro no encontrado o no disponible.');
                req.flash('formData', req.body);
                return res.redirect('/loans/new');
            }

            // 2. Verificar usuario
            const [users] = await connection.query("SELECT username FROM users WHERE id_user = ? AND role = 'user' AND status = 'active'", [id_user]);
            if (users.length === 0) {
                await connection.rollback();
                req.flash('error', 'Usuario no encontrado, no es un usuario regular o está inactivo.');
                req.flash('formData', req.body);
                return res.redirect('/loans/new');
            }
            
            // 3. (Opcional) Verificar si el usuario ya tiene muchos préstamos o uno del mismo libro activo
            // const [existingLoans] = await connection.query("SELECT COUNT(*) as count FROM loans WHERE id_user = ? AND id_book = ? AND status = 'prestado'", [id_user, id_book]);
            // if (existingLoans[0].count > 0) {
            //     await connection.rollback();
            //     req.flash('error', 'El usuario ya tiene un préstamo activo para este libro.');
            //     req.flash('formData', req.body);
            //     return res.redirect('/loans/new');
            // }            // 4. Insertar préstamo
            const loan_date = new Date();
            const formattedLoanDate = formatDateForDb(loan_date);
              await connection.query(
                "INSERT INTO loans (id_book, id_user, loan_date, due_date, status) VALUES (?, ?, ?, ?, 'aprobado')",
                [id_book, id_user, formattedLoanDate, formattedDueDate]
            );            // No decrementamos stock pues no existe esa columna

            await connection.commit();
            req.flash('success', 'Préstamo registrado exitosamente.');
            res.redirect('/loans');

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error creating loan:', error);
            req.flash('error', 'Error al registrar el préstamo. Inténtelo de nuevo.');
            req.flash('formData', req.body);
            res.redirect('/loans/new');
        } finally {
            if (connection) connection.release();
        }
    },    // Listar todos los préstamos (para admin/librarian)
    listAllLoans: async (req, res) => {
        try {
            console.log('Iniciando listado de préstamos...');
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            // Filtros (ejemplo básico)
            let whereClauses = [];
            let queryParams = [];
            
            if (req.query.status_filter && req.query.status_filter !== '') {
                whereClauses.push("l.status = ?");
                queryParams.push(req.query.status_filter);
            }
            if (req.query.user_search) {
                whereClauses.push("(u.username LIKE ? OR u.email LIKE ?)");
                queryParams.push(`%${req.query.user_search}%`);
                queryParams.push(`%${req.query.user_search}%`);
            }
            if (req.query.book_search) {
                whereClauses.push("(b.title LIKE ? OR b.isbn LIKE ?)");
                queryParams.push(`%${req.query.book_search}%`);
                queryParams.push(`%${req.query.book_search}%`);
            }

            const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
            
            console.log('Ejecutando consulta SQL para préstamos...');
            console.log('Cláusulas WHERE:', whereString);
            console.log('Parámetros:', queryParams);
              try {
                const [loans] = await db.query(
                    `SELECT l.id_loan, b.name AS book_title, u.username, l.loan_date, l.due_date, l.return_date, l.status 
                     FROM loans l 
                     JOIN books b ON l.id_book = b.id_book 
                     JOIN users u ON l.id_user = u.id_user 
                     ${whereString}
                     ORDER BY l.loan_date DESC 
                     LIMIT ? OFFSET ?`,
                    [...queryParams, limit, offset]
                );
                
                console.log(`Préstamos encontrados: ${loans.length}`);                const [totalLoansResult] = await db.query(
                    `SELECT COUNT(*) AS total 
                     FROM loans l
                     JOIN books b ON l.id_book = b.id_book
                     JOIN users u ON l.id_user = u.id_user
                     ${whereString}`,
                    queryParams
                );
                const totalLoans = totalLoansResult[0].total;
                const totalPages = Math.ceil(totalLoans / limit);
                
                console.log('Total préstamos:', totalLoans);
                console.log('Total páginas:', totalPages);

                res.render('loans/index', {
                    title: 'Gestión de Préstamos',
                    pageTitle: 'Gestión de Préstamos',
                    loans,
                    currentPage: page,
                    totalPages,
                    queryParams: req.query,
                    messages: {
                        error: req.flash('error'),
                        success: req.flash('success')
                    }
                });
            } catch (dbError) {
                console.error('Error en la base de datos:', dbError);
                throw dbError;
            }
        } catch (error) {
            console.error('Error listing loans:', error);
            req.flash('error', 'Error al cargar la lista de préstamos: ' + (error.message || 'Error desconocido'));
            // Renderizar con datos vacíos en lugar de redirigir
            res.render('loans/index', {
                title: 'Gestión de Préstamos',
                pageTitle: 'Gestión de Préstamos',
                loans: [],
                currentPage: 1,
                totalPages: 1,
                queryParams: {},
                messages: {
                    error: req.flash('error'),
                    success: req.flash('success')
                }
            });
        }
    },

    // Marcar un préstamo como devuelto
    markAsReturned: async (req, res) => {
        const { id_loan } = req.params;
        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();            // 1. Verificar que el préstamo exista y no esté ya devuelto
            const [loanResults] = await connection.query("SELECT id_book, status FROM loans WHERE id_loan = ?", [id_loan]);
            if (loanResults.length === 0) {
                await connection.rollback();
                req.flash('error', 'Préstamo no encontrado.');
                return res.redirect('/loans');
            }
            const loan = loanResults[0];            if (loan.status === 'devuelto') {
                await connection.rollback();
                req.flash('info', 'Este préstamo ya ha sido marcado como devuelto.');
                return res.redirect('/loans');
            }

            // 2. Actualizar estado del préstamo y fecha de devolución
            const return_date = new Date();
            const formattedReturnDate = formatDateForDb(return_date);
            await connection.query(
                "UPDATE loans SET status = 'devuelto', return_date = ? WHERE id_loan = ?",
                [formattedReturnDate, id_loan]
            );            // No incrementamos stock pues no existe esa columna

            await connection.commit();
            req.flash('success', 'Préstamo marcado como devuelto exitosamente.');
            res.redirect('/loans');

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error marking loan as returned:', error);
            req.flash('error', 'Error al marcar el préstamo como devuelto.');
            res.redirect('/loans');
        } finally {
            if (connection) connection.release();
        }
    },    // Listar préstamos del usuario autenticado
    listMyLoans: async (req, res) => {
        try {
            console.log('Iniciando listado de préstamos del usuario...');
            console.log('Usuario en sesión:', req.session.user ? 'Autenticado' : 'No autenticado');
            
            // Check if user exists in session and has required properties
            if (!req.session.user || !req.session.user.id_user) {
                console.error('Error: Sesión de usuario no válida');
                req.flash('error', 'Error: Sesión de usuario no válida. Por favor inicie sesión nuevamente.');
                return res.redirect('/auth/login');
            }

            const id_user = req.session.user.id_user;
            console.log('ID de usuario:', id_user);
            
            try {                const [loans] = await db.query(
                    `SELECT l.id_loan, b.name AS book_title, l.loan_date, l.due_date, l.return_date, l.status 
                     FROM loans l 
                     JOIN books b ON l.id_book = b.id_book 
                     WHERE l.id_user = ? 
                     ORDER BY l.loan_date DESC`,
                    [id_user]
                );
                
                console.log(`Préstamos encontrados para el usuario: ${loans.length}`);

                res.render('profile/my_loans', {
                    title: 'Mis Préstamos',
                    pageTitle: 'Mis Préstamos',
                    loans,
                    messages: {
                        error: req.flash('error'),
                        success: req.flash('success')
                    },
                    user: req.session.user,
                    userName: req.session.user ? req.session.user.username : undefined,
                    userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined
                });
            } catch (dbError) {
                console.error('Error en consulta a la base de datos:', dbError);
                throw dbError;
            }
        } catch (error) {
            console.error('Error detallado al listar préstamos del usuario:', error);
            req.flash('error', 'Error al cargar tus préstamos: ' + (error.message || 'Error desconocido'));
            // Renderizar con datos vacíos en lugar de redirigir
            res.render('profile/my_loans', {
                title: 'Mis Préstamos',
                pageTitle: 'Mis Préstamos',
                loans: [],
                messages: {
                    error: req.flash('error'),
                    success: req.flash('success')
                },
                user: req.session.user,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined            });
        }
    },
    
    // Renovar un préstamo
    renewLoan: async (req, res) => {
        const { id_loan } = req.params;
        let connection;
        
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();
            
            // 1. Verificar que el préstamo exista y pueda ser renovado
            const [loanResults] = await connection.query(
                `SELECT l.*, b.name AS book_title, u.username 
                 FROM loans l
                 JOIN books b ON l.id_book = b.id_book
                 JOIN users u ON l.id_user = u.id_user
                 WHERE l.id_loan = ?`, 
                [id_loan]
            );
            
            if (loanResults.length === 0) {
                await connection.rollback();
                req.flash('error', 'Préstamo no encontrado.');
                return res.redirect('/profile');
            }
            
            const loan = loanResults[0];
            
            // Verificar que el préstamo pertenece al usuario actual (a menos que sea admin/librarian)
            if (loan.id_user !== req.session.user.id_user && 
                !['admin', 'librarian'].includes(req.session.user.role)) {
                await connection.rollback();
                req.flash('error', 'No tienes permiso para renovar este préstamo.');
                return res.redirect('/profile');
            }
            
            // Verificar que el préstamo esté en estado aprobado
            if (loan.status !== 'aprobado') {
                await connection.rollback();
                req.flash('error', `No se puede renovar un préstamo con estado "${loan.status}".`);
                return res.redirect('/profile');
            }
            
            // Verificar que el préstamo no haya sido devuelto
            if (loan.return_date) {
                await connection.rollback();
                req.flash('error', 'No se puede renovar un préstamo que ya ha sido devuelto.');
                return res.redirect('/profile');
            }
            
            // 2. Calcular nueva fecha de vencimiento (14 días desde hoy)
            const newDueDate = new Date();
            newDueDate.setDate(newDueDate.getDate() + 14);
            const formattedNewDueDate = formatDateForDb(newDueDate);
            
            // 3. Actualizar la fecha de vencimiento del préstamo
            await connection.query(
                "UPDATE loans SET due_date = ? WHERE id_loan = ?",
                [formattedNewDueDate, id_loan]
            );
            
            await connection.commit();
            req.flash('success', `Préstamo del libro "${loan.book_title}" renovado exitosamente. Nueva fecha de devolución: ${newDueDate.toLocaleDateString('es-ES')}`);
            
            // Redirigir al usuario a la página apropiada según su rol
            if (['admin', 'librarian'].includes(req.session.user.role) && loan.id_user !== req.session.user.id_user) {
                return res.redirect('/loans');
            } else {
                return res.redirect('/profile');
            }
            
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error renovando préstamo:', error);
            req.flash('error', 'Error al renovar el préstamo: ' + (error.message || 'Error desconocido'));
            res.redirect('/profile');
        } finally {
            if (connection) connection.release();
        }
    }
};

module.exports = LoanController;
