const db = require('./lib/db');

async function createOrUpdateLoansTable() {
    let connection;
    try {
        console.log('🔧 Verificando y actualizando la tabla loans...');
        connection = await db.getConnection();

        // 1. Verificar si la tabla loans existe
        const [tableExists] = await connection.query("SHOW TABLES LIKE 'loans'");
        
        if (tableExists.length === 0) {
            console.log('📋 La tabla loans no existe. Creándola...');
            await connection.query(`
                CREATE TABLE loans (
                    id_loan INT PRIMARY KEY AUTO_INCREMENT,
                    id_book INT NOT NULL,
                    id_user INT NOT NULL,
                    loan_date DATE NOT NULL,
                    due_date DATE NOT NULL,
                    return_date DATE NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'solicitado',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    CONSTRAINT fk_loans_book FOREIGN KEY (id_book) REFERENCES books(id_book) ON DELETE CASCADE,
                    CONSTRAINT fk_loans_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
                )
            `);
            console.log('✅ Tabla loans creada correctamente');
        } else {
            console.log('📋 La tabla loans ya existe. Verificando estructura...');
            
            // Verificar si existe la columna status
            const [columns] = await connection.query("SHOW COLUMNS FROM loans LIKE 'status'");
            
            if (columns.length === 0) {
                console.log('📝 Añadiendo columna status...');
                await connection.query("ALTER TABLE loans ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'solicitado'");
            } else {
                console.log('✅ La columna status ya existe');
                // Verificar el tipo de la columna status
                if (columns[0].Type.toLowerCase().includes('enum')) {
                    console.log('📝 Cambiando tipo de columna status de ENUM a VARCHAR...');
                    
                    // Desactivar temporalmente restricciones de clave foránea
                    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
                    
                    // Modificar el tipo de la columna
                    await connection.query("ALTER TABLE loans MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'solicitado'");
                    
                    // Reactivar restricciones de clave foránea
                    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
                    
                    // Actualizar valores existentes si es necesario
                    await connection.query("UPDATE loans SET status = 'solicitado' WHERE status = 'requested'");
                    await connection.query("UPDATE loans SET status = 'aprobado' WHERE status = 'approved'");
                    await connection.query("UPDATE loans SET status = 'devuelto' WHERE status = 'returned'");
                    await connection.query("UPDATE loans SET status = 'vencido' WHERE status = 'overdue'");
                    await connection.query("UPDATE loans SET status = 'rechazado' WHERE status = 'rejected'");
                }
            }
        }
        
        // Crear un préstamo de prueba
        console.log('🔍 Verificando si existen préstamos...');
        const [loanCount] = await connection.query("SELECT COUNT(*) as count FROM loans");
        
        if (loanCount[0].count === 0) {
            console.log('📚 Creando préstamo de prueba...');
            
            // Obtener un libro activo
            const [books] = await connection.query("SELECT id_book, name FROM books WHERE state = 1 LIMIT 1");
            
            if (books.length === 0) {
                console.log('⚠️ No hay libros activos disponibles para crear préstamos de prueba');
            } else {
                // Obtener un usuario activo
                const [users] = await connection.query("SELECT id_user, username FROM users WHERE status = 'active' LIMIT 1");
                
                if (users.length === 0) {
                    console.log('⚠️ No hay usuarios activos disponibles para crear préstamos de prueba');
                } else {
                    const book = books[0];
                    const user = users[0];
                    
                    const today = new Date();
                    const dueDate = new Date();
                    dueDate.setDate(today.getDate() + 14); // préstamo por 14 días
                    
                    const formattedToday = today.toISOString().split('T')[0];
                    const formattedDueDate = dueDate.toISOString().split('T')[0];
                    
                    await connection.query(
                        "INSERT INTO loans (id_book, id_user, loan_date, due_date, status) VALUES (?, ?, ?, ?, 'aprobado')",
                        [book.id_book, user.id_user, formattedToday, formattedDueDate]
                    );
                    
                    console.log(`✅ Préstamo de prueba creado exitosamente:`);
                    console.log(`   - Libro: ${book.name} (ID: ${book.id_book})`);
                    console.log(`   - Usuario: ${user.username} (ID: ${user.id_user})`);
                }
            }
        } else {
            console.log(`✅ Ya existen ${loanCount[0].count} préstamos en la base de datos`);
        }
        
        // Mostrar estructura final de la tabla
        console.log('\n📊 Estructura actual de la tabla loans:');
        const [finalColumns] = await connection.query("DESCRIBE loans");
        console.table(finalColumns.map(col => ({ 
            Field: col.Field, 
            Type: col.Type, 
            Null: col.Null === 'YES' ? 'NULL permitido' : 'NOT NULL', 
            Default: col.Default || 'Sin valor predeterminado'
        })));
        
        // Mostrar algunos préstamos existentes
        if (loanCount[0].count > 0) {
            console.log('\n📋 Muestra de préstamos existentes:');
            const [sampleLoans] = await connection.query(`
                SELECT l.id_loan, b.name AS nombre_libro, u.username AS nombre_usuario, 
                       l.loan_date, l.due_date, l.return_date, l.status
                FROM loans l
                JOIN books b ON l.id_book = b.id_book
                JOIN users u ON l.id_user = u.id_user
                LIMIT 5
            `);
            
            console.table(sampleLoans.map(loan => ({
                ID: loan.id_loan,
                Libro: loan.nombre_libro,
                Usuario: loan.nombre_usuario,
                'Fecha Préstamo': new Date(loan.loan_date).toLocaleDateString('es-ES'),
                'Fecha Vencimiento': new Date(loan.due_date).toLocaleDateString('es-ES'),
                'Fecha Devolución': loan.return_date ? new Date(loan.return_date).toLocaleDateString('es-ES') : 'No devuelto',
                Estado: loan.status
            })));
        }
        
        console.log('\n✅ Proceso completado exitosamente');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

createOrUpdateLoansTable();
