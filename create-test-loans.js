/**
 * Script para crear préstamos de prueba
 * Este script genera diferentes tipos de préstamos para probar el sistema de notificaciones
 */

const db = require('./lib/db');

async function createTestLoans() {
    try {
        console.log('🔧 Creando préstamos de prueba para el sistema de notificaciones...');
        
        // 1. Obtener algunos libros disponibles
        const [books] = await db.query(`
            SELECT id_book, name FROM books 
            WHERE state = 1 
            LIMIT 5
        `);
        
        if (books.length === 0) {
            console.log('❌ No hay libros disponibles para crear préstamos de prueba.');
            return;
        }
        
        // 2. Obtener usuarios para asignarles préstamos
        const [users] = await db.query(`
            SELECT id_user, username FROM users 
            WHERE role = 'user'
            LIMIT 3
        `);
        
        if (users.length === 0) {
            console.log('❌ No hay usuarios disponibles para crear préstamos de prueba.');
            return;
        }        // 3. Eliminar préstamos existentes para usuarios de prueba
        console.log('🗑️ Eliminando préstamos previos de prueba...');
        const userIds = users.map(user => user.id_user);
        console.log('IDs de usuarios:', userIds);
        
        for (const userId of userIds) {
            await db.query('DELETE FROM loans WHERE id_user = ?', [userId]);
            console.log(`- Préstamos eliminados para usuario ID: ${userId}`);
        }
        // Fechas para tipos diferentes de préstamos
        const today = new Date();
        
        // Fecha vencida (hace 10 días)
        const overdueDate = new Date(today);
        overdueDate.setDate(today.getDate() - 10);
        
        // Fecha vence pronto (en 2 días)
        const dueSoonDate = new Date(today);
        dueSoonDate.setDate(today.getDate() + 2);
        
        // Fecha vence en un futuro (en 15 días)
        const dueLaterDate = new Date(today);
        dueLaterDate.setDate(today.getDate() + 15);

        // 4. Crear préstamos para cada usuario
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            
            // Préstamo vencido
            if (books[0]) {
                await createLoan(
                    books[0].id_book,
                    user.id_user,
                    formatDate(overdueDate),
                    'aprobado'
                );
                console.log(`✅ Préstamo vencido creado para ${user.username} (Libro: ${books[0].name})`);
            }
            
            // Préstamo que vence pronto
            if (books[1]) {
                await createLoan(
                    books[1].id_book,
                    user.id_user,
                    formatDate(dueSoonDate),
                    'aprobado'
                );
                console.log(`✅ Préstamo próximo a vencer creado para ${user.username} (Libro: ${books[1].name})`);
            }
            
            // Préstamo con fecha amplia
            if (books[2]) {
                await createLoan(
                    books[2].id_book,
                    user.id_user,
                    formatDate(dueLaterDate),
                    'aprobado'
                );
                console.log(`✅ Préstamo normal creado para ${user.username} (Libro: ${books[2].name})`);
            }
            
            // Préstamo devuelto
            if (books[3]) {
                await createLoan(
                    books[3].id_book,
                    user.id_user,
                    formatDate(overdueDate),
                    'devuelto',
                    formatDate(today)
                );
                console.log(`✅ Préstamo devuelto creado para ${user.username} (Libro: ${books[3].name})`);
            }
        }
        
        console.log('✅ Préstamos de prueba creados correctamente!');
    } catch (error) {
        console.error('Error al crear préstamos de prueba:', error);
    } finally {
        await db.end();
    }
}

// Función auxiliar para crear un préstamo
async function createLoan(idBook, idUser, dueDate, status, returnDate = null) {
    const today = new Date();
    const loanDate = formatDate(today);
    
    await db.query(`
        INSERT INTO loans 
        (id_book, id_user, loan_date, due_date, return_date, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [idBook, idUser, loanDate, dueDate, returnDate, status]);
}

// Función para formatear una fecha en formato YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Ejecutar el script
createTestLoans();
