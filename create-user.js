// Script para crear un nuevo usuario en el sistema
const bcrypt = require('bcryptjs');
const dbConn = require('./lib/db');

async function createUser() {
    try {
        console.log("Iniciando creación de usuario...");
        
        // Datos del usuario a crear - modifica estos valores según lo necesites
        const userData = {
            username: 'usuario_nuevo',   // Cambia esto por el nombre de usuario deseado
            email: 'usuario@ejemplo.com', // Cambia esto por el email deseado
            password: 'password123',      // Cambia esto por la contraseña deseada
            role: 'user',                // Opciones: 'admin', 'librarian', 'user'
            status: 'active'             // Opciones: 'active', 'inactive'
        };
        
        console.log(`Generando hash para la contraseña de "${userData.username}"`);
        // Generar hash de la contraseña
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        console.log("Creando usuario en la base de datos...");
        // Insertar el usuario en la base de datos
        const [result] = await dbConn.query(
            'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [userData.username, userData.email, hashedPassword, userData.role, userData.status]
        );
        
        if (result.insertId) {
            console.log(`¡Usuario creado con éxito!`);
            console.log(`ID: ${result.insertId}`);
            console.log(`Usuario: ${userData.username}`);
            console.log(`Email: ${userData.email}`);
            console.log(`Rol: ${userData.role}`);
            console.log(`Contraseña: ${userData.password}`);
            console.log("\nPuedes iniciar sesión con estos datos.");
        } else {
            console.log(`Error: No se pudo crear el usuario.`);
        }
    } catch (error) {
        console.error('Error al crear el usuario:');
        
        // Si es un error de duplicado (username o email ya existen)
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('El nombre de usuario o el email ya están en uso. Por favor, intenta con otros valores.');
        } else {
            console.error(error);
        }
    }
    
    // Esperamos un poco antes de salir para asegurarnos de que todas las operaciones se completan
    setTimeout(() => {
        console.log("Proceso completado. Saliendo...");
        process.exit();
    }, 2000);
}

// Ejecutar la función
createUser();
