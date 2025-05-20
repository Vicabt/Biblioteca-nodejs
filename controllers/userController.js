const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

const UserController = {
    // Listar usuarios (solo admin)
    async listUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const { role, status } = req.query;
            
            const result = await UserModel.listUsers({ 
                role, 
                status, 
                page, 
                limit: 10 
            });

            res.render('admin/users/list', {
                title: 'Gestión de Usuarios',
                users: result.users,
                currentPage: result.page,
                totalPages: result.totalPages,
                role,
                status,
                error: req.flash('error'),
                success: req.flash('success'),
                user: req.session.user || null,
                userName: req.session.user ? req.session.user.username : undefined,
                userImagePath: req.session.user && req.session.user.imagePath ? req.session.user.imagePath : undefined,
            });
        } catch (error) {
            console.error('Error al listar usuarios:', error);
            req.flash('error', 'Error al cargar la lista de usuarios');
            res.redirect('/');
        }
    },

    // Mostrar formulario de creación
    showCreateForm(req, res) {
        res.render('admin/users/form', {
            title: 'Crear Usuario',
            user: null,
            error: req.flash('error'),
            success: req.flash('success')
        });
    },

    // Crear nuevo usuario
    async createUser(req, res) {
        const { username, email, password, role, status } = req.body;

        try {
            // Validaciones básicas
            if (!username || !email || !password) {
                req.flash('error', 'Todos los campos son obligatorios');
                return res.redirect('/admin/users/new');
            }

            // Verificar si el usuario ya existe
            const existingUser = await UserModel.findByUsernameOrEmail(username);
            if (existingUser) {
                req.flash('error', 'El nombre de usuario ya está en uso');
                return res.redirect('/admin/users/new');
            }

            const existingEmail = await UserModel.findByUsernameOrEmail(email);
            if (existingEmail) {
                req.flash('error', 'El email ya está en uso');
                return res.redirect('/admin/users/new');
            }

            // Crear usuario
            await UserModel.createUser({
                username,
                email,
                password,
                role: role || 'user',
                status: status || 'active'
            });

            req.flash('success', 'Usuario creado exitosamente');
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Error al crear usuario:', error);
            req.flash('error', 'Error al crear el usuario');
            res.redirect('/admin/users/new');
        }
    },

    // Mostrar formulario de edición
    async showEditForm(req, res) {
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user) {
                req.flash('error', 'Usuario no encontrado');
                return res.redirect('/admin/users');
            }

            res.render('admin/users/form', {
                title: 'Editar Usuario',
                user,
                error: req.flash('error'),
                success: req.flash('success')
            });
        } catch (error) {
            console.error('Error al cargar formulario de edición:', error);
            req.flash('error', 'Error al cargar el formulario de edición');
            res.redirect('/admin/users');
        }
    },

    // Actualizar usuario
    async updateUser(req, res) {
        const { username, email, password, role, status } = req.body;
        const userId = req.params.id;

        try {
            // Validar que el usuario existe
            const existingUser = await UserModel.findById(userId);
            if (!existingUser) {
                req.flash('error', 'Usuario no encontrado');
                return res.redirect('/admin/users');
            }

            // Verificar duplicados de username/email
            if (username !== existingUser.username) {
                const userWithUsername = await UserModel.findByUsernameOrEmail(username);
                if (userWithUsername) {
                    req.flash('error', 'El nombre de usuario ya está en uso');
                    return res.redirect(`/admin/users/${userId}/edit`);
                }
            }

            if (email !== existingUser.email) {
                const userWithEmail = await UserModel.findByUsernameOrEmail(email);
                if (userWithEmail) {
                    req.flash('error', 'El email ya está en uso');
                    return res.redirect(`/admin/users/${userId}/edit`);
                }
            }

            // Actualizar usuario
            const updateData = {
                username,
                email,
                role,
                status
            };

            // Solo actualizar contraseña si se proporciona una nueva
            if (password) {
                updateData.password = password;
            }

            await UserModel.updateUser(userId, updateData);

            req.flash('success', 'Usuario actualizado exitosamente');
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            req.flash('error', 'Error al actualizar el usuario');
            res.redirect(`/admin/users/${userId}/edit`);
        }
    },

    // Cambiar estado de usuario
    async toggleStatus(req, res) {
        try {
            const userId = req.params.id;
            const success = await UserModel.toggleStatus(userId);
            
            if (success) {
                req.flash('success', 'Estado del usuario actualizado exitosamente');
            } else {
                req.flash('error', 'No se pudo actualizar el estado del usuario');
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            req.flash('error', 'Error al cambiar el estado del usuario');
        }
        res.redirect('/admin/users');
    },

    // Mostrar formulario de cambio de contraseña
    showChangePasswordForm(req, res) {
        res.render('profile/change-password', {
            title: 'Cambiar Contraseña',
            error: req.flash('error'),
            success: req.flash('success')
        });
    },

    // Procesar cambio de contraseña
    async changePassword(req, res) {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.session.user.id_user;

        try {
            if (newPassword !== confirmPassword) {
                req.flash('error', 'Las contraseñas nuevas no coinciden');
                return res.redirect('/profile/change-password');
            }

            const user = await UserModel.findById(userId);
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);

            if (!isValidPassword) {
                req.flash('error', 'Contraseña actual incorrecta');
                return res.redirect('/profile/change-password');
            }

            await UserModel.updateUser(userId, { password: newPassword });
            req.flash('success', 'Contraseña actualizada exitosamente');
            res.redirect('/profile/change-password');
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            req.flash('error', 'Error al cambiar la contraseña');
            res.redirect('/profile/change-password');
        }
    }
};

module.exports = UserController; 