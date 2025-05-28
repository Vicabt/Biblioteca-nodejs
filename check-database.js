// Script para verificar la estructura de la base de datos
const dbConn = require('./lib/db');

async function checkDatabase() {
    try {
        console.log("Verificando la conexión a la base de datos...");
        
        // Verificar la conexión
        await dbConn.getConnection();
        console.log("✅ Conexión exitosa a la base de datos");
        
        // Verificar la tabla de usuarios
        console.log("\nVerificando la tabla de usuarios...");
        const [tables] = await dbConn.query("SHOW TABLES LIKE 'users'");
        
        if (tables.length === 0) {
            console.log("❌ La tabla 'users' no existe. La base de datos puede no estar correctamente configurada.");
            console.log("Sugerencia: Ejecuta el archivo database.sql para crear la estructura necesaria.");
            return;
        }
        
        console.log("✅ La tabla 'users' existe");
        
        // Verificar la estructura de la tabla de usuarios
        console.log("\nVerificando la estructura de la tabla 'users'...");
        const [columns] = await dbConn.query("DESCRIBE users");
        
        const requiredColumns = ['id_user', 'username', 'email', 'password', 'role', 'status'];
        const missingColumns = requiredColumns.filter(col => 
            !columns.find(c => c.Field === col)
        );
        
        if (missingColumns.length > 0) {
            console.log(`❌ Faltan columnas en la tabla 'users': ${missingColumns.join(', ')}`);
            console.log("Sugerencia: Ejecuta el archivo database.sql para crear la estructura necesaria.");
        } else {
            console.log("✅ La estructura de la tabla 'users' es correcta");
        }
        
        // Verificar si existen usuarios en la tabla
        console.log("\nVerificando la existencia de usuarios...");
        const [users] = await dbConn.query("SELECT id_user, username, role, status FROM users");
        
        if (users.length === 0) {
            console.log("❌ No hay usuarios en la base de datos");
            console.log("Sugerencia: Ejecuta el script 'create-default-users.js' para crear usuarios predeterminados.");
        } else {
            console.log(`✅ Encontrados ${users.length} usuarios en la base de datos`);
            
            // Mostrar usuarios existentes
            console.log("\nUsuarios existentes:");
            console.table(users);
            
            // Verificar si existe el usuario admin
            const adminUser = users.find(user => user.username === 'admin');
            if (adminUser) {
                console.log("✅ El usuario 'admin' existe");
            } else {
                console.log("❌ El usuario 'admin' no existe");
                console.log("Sugerencia: Ejecuta el script 'create-default-users.js' para crear el usuario administrador.");
            }
        }
        
        console.log("\nProceso de verificación completado.");
        
    } catch (error) {
        console.error("Error al verificar la base de datos:", error);
        console.log("\nSugerencias de solución:");
        console.log("1. Verifica que el servidor MySQL/MariaDB esté en ejecución");
        console.log("2. Comprueba las credenciales en lib/db.js");
        console.log("3. Asegúrate de que la base de datos 'ejercicio_biblioteca_nodejs' existe");
        console.log("4. Ejecuta el archivo database.sql para crear la estructura necesaria");
    }
    
    setTimeout(() => {
        process.exit();
    }, 2000);
}

// Ejecutar la función
checkDatabase();
