const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

const ProfileController = {
    // Mostrar perfil del usuario
    showProfile(req, res) {
        // Ya no necesitamos definir notificaciones aquí, lo hace el middleware
        res.render('profile/index', {
            title: 'Mi Perfil',
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success')
        });
    },

    // Mostrar formulario de edición del perfil
    showEditForm(req, res) {
        res.render('profile/edit', {
            title: 'Editar Mi Perfil',
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success')
        });
    },

    // Actualizar perfil del usuario
    async updateProfile(req, res) {
        const { username, email } = req.body;
        const userId = req.session.user.id_user;

        try {
            // Validaciones básicas
            if (!username || !email) {
                req.flash('error', 'Todos los campos son obligatorios');
                return res.redirect('/profile/edit');
            }

            // Obtener usuario actual para comparar
            const currentUser = await UserModel.findById(userId);
            if (!currentUser) {
                req.flash('error', 'Usuario no encontrado');
                return res.redirect('/profile');
            }

            // Verificar duplicados solo si cambió el username
            if (username !== currentUser.username) {
                const userWithUsername = await UserModel.findByUsernameOrEmail(username);
                if (userWithUsername && userWithUsername.id_user !== userId) {
                    req.flash('error', 'El nombre de usuario ya está en uso');
                    return res.redirect('/profile/edit');
                }
            }

            // Verificar duplicados solo si cambió el email
            if (email !== currentUser.email) {
                const userWithEmail = await UserModel.findByUsernameOrEmail(email);
                if (userWithEmail && userWithEmail.id_user !== userId) {
                    req.flash('error', 'El email ya está en uso');
                    return res.redirect('/profile/edit');
                }
            }

            // Actualizar usuario
            const updateData = { username, email };
            await UserModel.updateUser(userId, updateData);

            // Actualizar datos en la sesión
            req.session.user.username = username;
            req.session.user.email = email;

            req.flash('success', 'Perfil actualizado exitosamente');
            res.redirect('/profile');
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            req.flash('error', 'Error al actualizar el perfil');
            res.redirect('/profile/edit');
        }
    },

    // Mostrar formulario de cambio de contraseña
    showChangePasswordForm(req, res) {
        res.render('profile/change-password', {
            title: 'Cambiar Contraseña',
            user: req.session.user,
            error: req.flash('error'),
            success: req.flash('success')
        });
    },

    // Procesar cambio de contraseña
    async changePassword(req, res) {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.session.user.id_user;

        try {
            // Validaciones básicas
            if (!currentPassword || !newPassword || !confirmPassword) {
                req.flash('error', 'Todos los campos son obligatorios');
                return res.redirect('/profile/change-password');
            }

            if (newPassword !== confirmPassword) {
                req.flash('error', 'Las contraseñas nuevas no coinciden');
                return res.redirect('/profile/change-password');
            }

            if (newPassword.length < 6) {
                req.flash('error', 'La nueva contraseña debe tener al menos 6 caracteres');
                return res.redirect('/profile/change-password');
            }

            // Verificar contraseña actual
            const user = await UserModel.findById(userId);
            if (!user) {
                req.flash('error', 'Usuario no encontrado');
                return res.redirect('/profile');
            }

            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                req.flash('error', 'Contraseña actual incorrecta');
                return res.redirect('/profile/change-password');
            }

            // Actualizar contraseña
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

module.exports = ProfileController;
