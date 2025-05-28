// Script para restablecer contraseña de usuario
const bcrypt = require('bcryptjs');
const dbConn = require('./lib/db');

async function resetPassword() {
    try {
        console.log("Iniciando proceso de restablecimiento de contraseña...");
        
        // Estos son los datos del usuario y la nueva contraseña
        const username = 'admin';
        const newPassword = 'admin123'; // Cambia esta contraseña según lo necesites
        
        console.log(`Generando hash para la nueva contraseña de "${username}"`);
        // Generar hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log("Hash generado:", hashedPassword);
        
        console.log("Actualizando contraseña en la base de datos...");
        // Actualizar la contraseña en la base de datos
        const [result] = await dbConn.query(
            'UPDATE users SET password = ? WHERE username = ?',
            [hashedPassword, username]
        );
        
        if (result.affectedRows > 0) {
            console.log(`¡Contraseña restablecida con éxito para el usuario "${username}"!`);
            console.log(`Nueva contraseña: ${newPassword}`);
        } else {
            console.log(`Usuario "${username}" no encontrado.`);
            
            // Vamos a verificar si el usuario existe
            const [users] = await dbConn.query('SELECT id_user, username FROM users');
            console.log("Usuarios disponibles en el sistema:");
            console.table(users);
        }
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
    }
    
    // Esperamos un poco antes de salir para asegurarnos de que todas las operaciones se completan
    setTimeout(() => {
        console.log("Proceso completado. Saliendo...");
        process.exit();
    }, 2000);
}

// Ejecutar la función
resetPassword();
