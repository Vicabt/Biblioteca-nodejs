const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

const AuthController = {
    // Mostrar formulario de login
    showLogin(req, res) {
        res.render('auth/login', { 
            title: 'Iniciar Sesión',
            error: req.flash('error'),
            success: req.flash('success')
        });
    },

    // Procesar login
    async login(req, res) {
        const { username, password } = req.body;

        try {
            const user = await UserModel.findByUsernameOrEmail(username);
            
            if (!user) {
                req.flash('error', 'Usuario o contraseña incorrectos');
                return res.redirect('/auth/login');
            }

            if (user.status !== 'active') {
                req.flash('error', 'Su cuenta está inactiva. Contacte al administrador');
                return res.redirect('/auth/login');
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (!isValidPassword) {
                req.flash('error', 'Usuario o contraseña incorrectos');
                return res.redirect('/auth/login');
            }

            // Guardar usuario en sesión (sin la contraseña)
            const { password: _, ...userWithoutPassword } = user;
            req.session.user = userWithoutPassword;

            req.flash('success', '¡Bienvenido!');
            res.redirect('/');
        } catch (error) {
            console.error('Error en login:', error);
            req.flash('error', 'Error al iniciar sesión');
            res.redirect('/auth/login');
        }
    },

    // Cerrar sesión
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al cerrar sesión:', err);
            }
            res.redirect('/auth/login');
        });
    }
};

module.exports = AuthController; 