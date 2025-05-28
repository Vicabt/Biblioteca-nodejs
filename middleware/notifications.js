/**
 * Middleware para manejar notificaciones de usuario
 * Este middleware agrega información sobre notificaciones a todas las respuestas
 */
const db = require('../lib/db');

const notificationsMiddleware = async (req, res, next) => {
    try {
        // Inicializar valores predeterminados (evita errores si no se establecen)
        res.locals.hasNotifications = false;
        res.locals.notificationCount = 0;
        res.locals.notifications = [];
        
        // Solo procesamos si hay un usuario en la sesión
        if (req.session && req.session.user) {
            const userId = req.session.user.id_user;
            
            if (userId) {                // Consulta para préstamos vencidos
                const today = new Date().toISOString().split('T')[0];
                const [overdueLoans] = await db.query(`
                    SELECT l.id_loan, b.name AS book_title, 
                           DATEDIFF(CURRENT_DATE(), l.due_date) AS days_overdue,
                           l.due_date
                    FROM loans l 
                    JOIN books b ON l.id_book = b.id_book
                    WHERE l.id_user = ? 
                      AND l.status = 'aprobado'
                      AND l.due_date < ?
                      AND l.return_date IS NULL
                `, [userId, today]);
                
                // Consulta para préstamos próximos a vencer (en los próximos 3 días)
                const [dueSoonLoans] = await db.query(`
                    SELECT l.id_loan, b.name AS book_title, 
                           DATEDIFF(l.due_date, CURRENT_DATE()) AS days_remaining,
                           l.due_date
                    FROM loans l 
                    JOIN books b ON l.id_book = b.id_book
                    WHERE l.id_user = ? 
                      AND l.status = 'aprobado'
                      AND l.due_date > ?
                      AND l.due_date <= DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY)
                      AND l.return_date IS NULL
                `, [userId, today]);
                
                // Consultar reservas disponibles (simulado - podemos implementar tabla de reservas real después)
                // Esta es una simulación, en un sistema real consultarías una tabla específica para reservas
                const [availableReservations] = await db.query(`
                    SELECT b.id_book, b.name AS book_title
                    FROM books b 
                    WHERE b.state = 1 
                    LIMIT 1
                `);
                  // Procesar préstamos vencidos
                const overdueNotifications = overdueLoans.map(loan => ({
                    type: 'overdue',
                    icon: 'fas fa-book text-danger',
                    title: 'Libro vencido:',
                    message: `Tiene un préstamo pendiente de "${loan.book_title}".`,
                    detail: `Venció hace ${loan.days_overdue} ${loan.days_overdue === 1 ? 'día' : 'días'}`,
                    date: new Date(loan.due_date),
                    action: 'Renovar',
                    actionUrl: `/loans/${loan.id_loan}/renew`,
                    actionClass: 'btn-outline-primary'
                }));
                
                // Procesar préstamos próximos a vencer
                const dueSoonNotifications = dueSoonLoans.map(loan => ({
                    type: 'due-soon',
                    icon: 'fas fa-clock text-warning',
                    title: 'Vence pronto:',
                    message: `Su préstamo de "${loan.book_title}" está próximo a vencer.`,
                    detail: `Vence en ${loan.days_remaining} ${loan.days_remaining === 1 ? 'día' : 'días'}`,
                    date: new Date(loan.due_date),
                    action: 'Renovar',
                    actionUrl: `/loans/${loan.id_loan}/renew`,
                    actionClass: 'btn-outline-primary'
                }));
                
                // Procesar reservas disponibles (simuladas)
                const reservationNotifications = availableReservations.map(book => {
                    // Fecha futura (disponible hasta)
                    const availableUntilDate = new Date();
                    availableUntilDate.setDate(availableUntilDate.getDate() + 3);
                    
                    return {
                        type: 'reservation',
                        icon: 'fas fa-info-circle text-info',
                        title: 'Reserva disponible:',
                        message: `El libro "${book.book_title}" ya está disponible.`,
                        detail: `Disponible hasta: ${availableUntilDate.toLocaleDateString('es-ES')}`,
                        date: availableUntilDate,
                        action: 'Retirar',
                        actionUrl: `/loans/new?book_id=${book.id_book}`,
                        actionClass: 'btn-outline-success'
                    };
                });
                  // Combinar todas las notificaciones y ordenarlas por fecha
                const allNotifications = [...overdueNotifications, ...dueSoonNotifications, ...reservationNotifications];
                const notificationCount = allNotifications.length;
                
                if (notificationCount > 0) {
                    res.locals.hasNotifications = true;
                    res.locals.notificationCount = notificationCount;
                    res.locals.notifications = allNotifications;
                }
            }
        }
    } catch (error) {
        console.error('Error en el middleware de notificaciones:', error);
        // No establecemos notificaciones en caso de error
    }
    
    next();
};

module.exports = notificationsMiddleware;
