// Script para verificar credenciales de usuario
const dbConn = require('./lib/db');
const bcrypt = require('bcryptjs');

// Función para validar credenciales
async function validateCredentials(username, password) {
    try {
        console.log(`Verificando credenciales para el usuario: ${username}`);
        
        // Buscar al usuario en la base de datos
        const [rows] = await dbConn.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        
        if (rows.length === 0) {
            console.log(`❌ El usuario '${username}' no existe en la base de datos`);
            return false;
        }
        
        const user = rows[0];
        
        // Verificar el estado del usuario
        if (user.status !== 'active') {
            console.log(`❌ El usuario '${username}' está inactivo`);
            return false;
        }
        
        // Verificar la contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            console.log(`❌ Contraseña incorrecta para el usuario '${username}'`);
            return false;
        }
        
        console.log(`✅ Credenciales válidas para el usuario '${username}'`);
        console.log(`   Rol: ${user.role}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Estado: ${user.status}`);
        
        return true;
    } catch (error) {
        console.error('Error al validar credenciales:', error);
        return false;
    }
}

// Verificar usuarios predeterminados
async function checkDefaultUsers() {
    console.log("=== VERIFICACIÓN DE USUARIOS PREDETERMINADOS ===\n");
    
    const defaultUsers = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'librarian', password: 'librarian123', role: 'librarian' },
        { username: 'usuario', password: 'usuario123', role: 'user' }
    ];
    
    for (const user of defaultUsers) {
        console.log(`\n--- Verificando usuario: ${user.username} (${user.role}) ---`);
        const isValid = await validateCredentials(user.username, user.password);
        
        if (!isValid) {
            console.log(`\n⚠️ ACCIÓN RECOMENDADA para '${user.username}':`);
            console.log("  Ejecute el script 'create-default-users.js' para actualizar este usuario.");
        }
    }
    
    console.log("\n=== VERIFICACIÓN COMPLETADA ===");
    
    // Esperamos un poco antes de salir para asegurarnos de que todas las operaciones se completan
    setTimeout(() => {
        console.log("\nSaliendo...");
        process.exit();
    }, 2000);
}

// Ejecutar la función principal
checkDefaultUsers();
