const db = require('./lib/db');

async function createTestData() {
    try {
        console.log('Conectando a la base de datos...');
        
        // Crear autores de prueba
        console.log('Creando autores de prueba...');
        const [author1] = await db.query(
            "INSERT INTO authors (name, state) VALUES (?, 1) ON DUPLICATE KEY UPDATE id_author = LAST_INSERT_ID(id_author)",
            ['Gabriel García Márquez']
        );
        const [author2] = await db.query(
            "INSERT INTO authors (name, state) VALUES (?, 1) ON DUPLICATE KEY UPDATE id_author = LAST_INSERT_ID(id_author)",
            ['Isabel Allende']
        );
        
        // Crear categorías de prueba
        console.log('Creando categorías de prueba...');
        const [category1] = await db.query(
            "INSERT INTO categories (name, state) VALUES (?, 1) ON DUPLICATE KEY UPDATE id_category = LAST_INSERT_ID(id_category)",
            ['Ficción']
        );
        const [category2] = await db.query(
            "INSERT INTO categories (name, state) VALUES (?, 1) ON DUPLICATE KEY UPDATE id_category = LAST_INSERT_ID(id_category)",
            ['Literatura Latinoamericana']
        );
        
        // Crear editoriales de prueba
        console.log('Creando editoriales de prueba...');
        const [publisher1] = await db.query(
            "INSERT INTO publishers (name, state) VALUES (?, 1) ON DUPLICATE KEY UPDATE id_publisher = LAST_INSERT_ID(id_publisher)",
            ['Editorial Sudamericana']
        );
        const [publisher2] = await db.query(
            "INSERT INTO publishers (name, state) VALUES (?, 1) ON DUPLICATE KEY UPDATE id_publisher = LAST_INSERT_ID(id_publisher)",
            ['Editorial Planeta']
        );
        
        // Obtener IDs
        const [authors] = await db.query("SELECT id_author, name FROM authors WHERE name IN (?, ?)", 
            ['Gabriel García Márquez', 'Isabel Allende']);
        const [categories] = await db.query("SELECT id_category, name FROM categories WHERE name IN (?, ?)", 
            ['Ficción', 'Literatura Latinoamericana']);
        const [publishers] = await db.query("SELECT id_publisher, name FROM publishers WHERE name IN (?, ?)", 
            ['Editorial Sudamericana', 'Editorial Planeta']);
            
        console.log('Autores creados:', authors);
        console.log('Categorías creadas:', categories);
        console.log('Editoriales creadas:', publishers);
        
        // Crear libros de prueba
        console.log('Creando libros de prueba...');
        const books = [
            {
                title: 'Cien años de soledad',
                author_id: authors.find(a => a.name === 'Gabriel García Márquez').id_author,
                category_id: categories.find(c => c.name === 'Ficción').id_category,
                publisher_id: publishers.find(p => p.name === 'Editorial Sudamericana').id_publisher,
                isbn: '978-84-376-0494-7',
                publication_date: '1967-06-05',
                stock: 5
            },
            {
                title: 'La casa de los espíritus',
                author_id: authors.find(a => a.name === 'Isabel Allende').id_author,
                category_id: categories.find(c => c.name === 'Literatura Latinoamericana').id_category,
                publisher_id: publishers.find(p => p.name === 'Editorial Planeta').id_publisher,
                isbn: '978-84-08-04355-8',
                publication_date: '1982-10-01',
                stock: 3
            },
            {
                title: 'El amor en los tiempos del cólera',
                author_id: authors.find(a => a.name === 'Gabriel García Márquez').id_author,
                category_id: categories.find(c => c.name === 'Ficción').id_category,
                publisher_id: publishers.find(p => p.name === 'Editorial Sudamericana').id_publisher,
                isbn: '978-84-376-0495-4',
                publication_date: '1985-09-01',
                stock: 4
            }
        ];
        
        for (const book of books) {
            await db.query(
                `INSERT INTO books (title, id_author, id_category, id_publisher, isbn, publication_date, stock, state) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 1) 
                 ON DUPLICATE KEY UPDATE stock = VALUES(stock)`,
                [book.title, book.author_id, book.category_id, book.publisher_id, book.isbn, book.publication_date, book.stock]
            );
        }
        
        console.log('✅ Datos de prueba creados exitosamente!');
        console.log('📚 Libros creados:');
        const [createdBooks] = await db.query(`
            SELECT b.title, a.name as author, c.name as category, p.name as publisher, b.stock 
            FROM books b 
            JOIN authors a ON b.id_author = a.id_author 
            JOIN categories c ON b.id_category = c.id_category 
            JOIN publishers p ON b.id_publisher = p.id_publisher 
            WHERE b.state = 1
        `);
        console.table(createdBooks);
        
    } catch (error) {
        console.error('❌ Error creando datos de prueba:', error);
    } finally {
        process.exit();
    }
}

createTestData();
