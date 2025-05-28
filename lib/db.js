const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ejercicio_biblioteca_nodejs',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Aumentar el tiempo de espera de conexión
  connectTimeout: 10000
});

// Configurar un manejador global para errores de conexión
pool.on('error', err => {
  console.error('Error inesperado en el pool de conexiones MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Conexión a la base de datos perdida. Intentando reconectar...');
  }
});

// Test connection and provide detailed error messages
pool.getConnection()
  .then(conn => {
    console.log('✅ Conexión exitosa a la base de datos MySQL!');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'ejercicio_biblioteca_nodejs'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    conn.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('❌ Error al conectar a la base de datos MySQL:');
    console.error(`   Código de error: ${err.code}`);
    console.error(`   Mensaje: ${err.message}`);
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Posible causa: Credenciales incorrectas');
      console.error('   Solución: Verifique el usuario y contraseña en las variables de entorno o código');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('   Posible causa: El servidor MySQL no está en ejecución o la dirección/puerto son incorrectos');
      console.error('   Solución: Verifique que el servidor MySQL esté en ejecución y accesible');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('   Posible causa: La base de datos no existe');
      console.error('   Solución: Ejecute el script database.sql para crear la base de datos');
    }
    
    // Si la conexión a la base de datos es crítica, podemos detener la aplicación
    // process.exit(1);
  });

module.exports = pool;