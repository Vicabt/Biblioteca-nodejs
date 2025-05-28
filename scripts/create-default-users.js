// Script para crear los usuarios predeterminados del sistema
const bcrypt = require('bcryptjs');
const dbConn = require('./lib/db');

async function createDefaultUsers() {
    try {
        console.log("Iniciando creación de usuarios predeterminados...");
        
        // Datos de los usuarios predeterminados
        const defaultUsers = [
            {
                username: 'admin',
                email: 'admin@biblioteca.com',
                password: 'admin123',
                role: 'admin',
                status: 'active'
            },
            {
                username: 'librarian',
                email: 'librarian@biblioteca.com',
                password: 'librarian123',
                role: 'librarian',
                status: 'active'
            },
            {
                username: 'usuario',
                email: 'usuario@biblioteca.com',
                password: 'usuario123',
                role: 'user',
                status: 'active'
            }
        ];
        
        for (const userData of defaultUsers) {
            try {
                console.log(`\nVerificando si existe el usuario "${userData.username}"...`);
                
                // Verificar si el usuario ya existe
                const [existingRows] = await dbConn.query(
                    'SELECT * FROM users WHERE username = ?',
                    [userData.username]
                );
                
                if (existingRows.length > 0) {
                    console.log(`El usuario "${userData.username}" ya existe. Actualizando contraseña...`);
                    
                    // Generar hash de la contraseña
                    const hashedPassword = await bcrypt.hash(userData.password, 10);
                    
                    // Actualizar la contraseña del usuario existente
                    await dbConn.query(
                        'UPDATE users SET password = ?, email = ?, role = ?, status = ? WHERE username = ?',
                        [hashedPassword, userData.email, userData.role, userData.status, userData.username]
                    );
                    
                    console.log(`¡Contraseña actualizada con éxito para el usuario "${userData.username}"!`);
                } else {
                    console.log(`Creando nuevo usuario "${userData.username}"...`);
                    
                    // Generar hash de la contraseña
                    const hashedPassword = await bcrypt.hash(userData.password, 10);
                    
                    // Insertar el usuario en la base de datos
                    const [result] = await dbConn.query(
                        'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
                        [userData.username, userData.email, hashedPassword, userData.role, userData.status]
                    );
                    
                    if (result.insertId) {
                        console.log(`¡Usuario "${userData.username}" creado con éxito!`);
                        console.log(`ID: ${result.insertId}`);
                        console.log(`Rol: ${userData.role}`);
                    } else {
                        console.log(`Error: No se pudo crear el usuario "${userData.username}".`);
                    }
                }
            } catch (userError) {
                console.error(`Error procesando usuario "${userData.username}":`, userError);
            }
        }
        
        console.log("\n¡Proceso completado! Los usuarios predeterminados han sido creados o actualizados.");
        console.log("Puedes iniciar sesión con alguno de estos usuarios:");
        console.log("1. Usuario: admin | Contraseña: admin123 | Rol: Administrador");
        console.log("2. Usuario: librarian | Contraseña: librarian123 | Rol: Bibliotecario");
        console.log("3. Usuario: usuario | Contraseña: usuario123 | Rol: Usuario");
        
    } catch (error) {
        console.error('Error al crear usuarios predeterminados:', error);
    }
    
    setTimeout(() => {
        process.exit();
    }, 2000);
}

// Ejecutar la función
createDefaultUsers();
