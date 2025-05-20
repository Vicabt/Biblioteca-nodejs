-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id_user INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'librarian', 'user') NOT NULL DEFAULT 'user',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de préstamos
CREATE TABLE IF NOT EXISTS loans (
    id_loan INT PRIMARY KEY AUTO_INCREMENT,
    id_book INT NOT NULL,
    id_user INT NOT NULL,
    loan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP NULL,
    status ENUM('requested', 'approved', 'rejected', 'returned', 'overdue') NOT NULL DEFAULT 'requested',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_book) REFERENCES books(id_book),
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);

-- Insertar usuario administrador inicial (contraseña: admin123)
INSERT INTO users (username, email, password, role, status) 
VALUES ('admin', 'admin@biblioteca.com', '$2b$10$YourHashedPasswordHere', 'admin', 'active')
ON DUPLICATE KEY UPDATE id_user = id_user; 