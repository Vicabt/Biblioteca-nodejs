const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ejercicio_biblioteca_nodejs',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: Test connection or log success (can be removed in production)
pool.getConnection()
  .then(conn => {
    console.log('Successfully connected to the database using mysql2 pool!');
    conn.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Failed to connect to the database using mysql2 pool:', err);
    // Consider exiting the process if the database connection is critical for startup
    // process.exit(1);
  });

module.exports = pool;