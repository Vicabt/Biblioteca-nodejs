/**
 * Middleware para manejar notificaciones de usuario
 * Este middleware agrega información sobre notificaciones a todas las respuestas
 */

const notificationsMiddleware = (req, res, next) => {
    try {
        // Inicializar valores predeterminados (evita errores si no se establecen)
        res.locals.hasNotifications = false;
        res.locals.notificationCount = 0;
        
        // Solo procesamos si hay un usuario en la sesión
        if (req.session && req.session.user) {
            // Aquí iría la lógica real para verificar notificaciones en la base de datos
            // Por ejemplo, verificar préstamos vencidos, mensajes sin leer, etc.
            
            // Si el usuario es admin o bibliotecario, mostramos algunas notificaciones demo
            if (req.session.user.role === 'admin' || req.session.user.role === 'librarian') {
                res.locals.hasNotifications = true;
                res.locals.notificationCount = req.session.user.role === 'admin' ? 2 : 1;
            }
        }
    } catch (error) {
        console.error('Error en el middleware de notificaciones:', error);
        // No establecemos notificaciones en caso de error
    }
    
    next();
};

module.exports = notificationsMiddleware;
