# Biblioteca CRUD - Sistema de Gestión de Biblioteca

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)

## Descripción

Sistema completo de gestión de biblioteca desarrollado con **Node.js**, **Express**, **EJS** y **MySQL**. Permite administrar libros, autores, categorías, editoriales, préstamos y usuarios a través de una interfaz web moderna, intuitiva y responsive.

### Características Principales

- ✅ **Sistema de autenticación y autorización** basado en roles (Admin, Bibliotecario, Usuario)
- ✅ **Gestión completa de usuarios** con perfiles personalizados
- ✅ **CRUD completo** para libros, autores, categorías y editoriales
- ✅ **Sistema de préstamos** con notificaciones
- ✅ **Interfaz responsive** con Bootstrap 5
- ✅ **Paginación inteligente** para todas las listas
- ✅ **Flash messages** para feedback al usuario
- ✅ **Panel de administración** integrado
- ✅ **Seguridad** con bcrypt para contraseñas

## Estructura de la Base de Datos

### Tabla `users` (Usuarios del Sistema)

| Campo      | Tipo de dato | Descripción                        |
|------------|--------------|------------------------------------|
| id_user    | INT (PK)     | Identificador único del usuario (autoincremental) |
| username   | VARCHAR(50)  | Nombre de usuario único            |
| email      | VARCHAR(100) | Correo electrónico único           |
| password   | VARCHAR(255) | Contraseña encriptada (bcrypt)     |
| role       | ENUM         | Rol: 'admin', 'librarian', 'user'  |
| status     | ENUM         | Estado: 'active', 'inactive'       |
| created_at | TIMESTAMP    | Fecha de creación                  |
| updated_at | TIMESTAMP    | Fecha de última actualización      |

### Tabla `authors` (Autores)

| Campo      | Tipo de dato | Descripción                        |
|------------|--------------|------------------------------------|
| id_author  | INT (PK)     | Identificador único del autor (autoincremental) |
| name       | VARCHAR      | Nombre del autor                   |
| state      | TINYINT/INT  | Estado (1 = Activo, 0 = Inactivo)  |

### Tabla `categories` (Categorías)

| Campo         | Tipo de dato | Descripción                        |
|---------------|--------------|------------------------------------|
| id_category   | INT (PK)     | Identificador único de la categoría (autoincremental) |
| name          | VARCHAR      | Nombre de la categoría             |
| state         | TINYINT/INT  | Estado (1 = Activo, 0 = Inactivo)  |

### Tabla `publishers` (Editoriales)

| Campo           | Tipo de dato | Descripción                        |
|-----------------|--------------|------------------------------------|
| id_publisher    | INT (PK)     | Identificador único de la editorial (autoincremental) |
| name            | VARCHAR      | Nombre de la editorial             |
| state           | TINYINT/INT  | Estado (1 = Activo, 0 = Inactivo)  |

### Tabla `books` (Libros)

| Campo           | Tipo de dato | Descripción                        |
|-----------------|--------------|------------------------------------|
| id_book         | INT (PK)     | Identificador único del libro (autoincremental) |
| title           | VARCHAR      | Título del libro                   |
| id_author       | INT (FK)     | Referencia al autor                |
| id_category     | INT (FK)     | Referencia a la categoría          |
| id_publisher    | INT (FK)     | Referencia a la editorial          |
| isbn            | VARCHAR      | Código ISBN del libro              |
| publication_date| DATE         | Fecha de publicación               |
| stock           | INT          | Cantidad en inventario             |
| state           | TINYINT/INT  | Estado (1 = Activo, 0 = Inactivo)  |

### Tabla `loans` (Préstamos)

| Campo      | Tipo de dato | Descripción                        |
|------------|--------------|------------------------------------|
| id_loan    | INT (PK)     | Identificador único del préstamo (autoincremental) |
| id_book    | INT (FK)     | Referencia al libro                |
| id_user    | INT (FK)     | Referencia al usuario              |
| loan_date  | TIMESTAMP    | Fecha del préstamo                 |
| due_date   | TIMESTAMP    | Fecha de vencimiento               |
| return_date| TIMESTAMP    | Fecha de devolución (nullable)     |
| status     | ENUM         | Estado del préstamo                |
| created_at | TIMESTAMP    | Fecha de creación                  |
| updated_at | TIMESTAMP    | Fecha de última actualización      |

## Estructura del Proyecto

```
nodejs-crud/
├── 📁 bin/
│   └── www                          # Punto de entrada del servidor
├── 📁 controllers/                  # Lógica de negocio
│   ├── authController.js           # Autenticación y autorización
│   ├── authorController.js         # Gestión de autores
│   ├── bookController.js           # Gestión de libros
│   ├── categoryController.js       # Gestión de categorías
│   ├── profileController.js        # Gestión de perfiles de usuario
│   ├── publisherController.js      # Gestión de editoriales
│   └── userController.js           # Gestión de usuarios (admin)
├── 📁 lib/
│   └── db.js                       # Configuración de base de datos
├── 📁 middleware/
│   ├── auth.js                     # Middleware de autenticación
│   ├── loanAuth.js                 # Middleware de préstamos
│   └── notifications.js           # Middleware de notificaciones
├── 📁 models/
│   └── userModel.js                # Modelo de datos de usuario
├── 📁 public/                      # Archivos estáticos
│   ├── 📁 images/
│   ├── 📁 javascripts/
│   └── 📁 stylesheets/
├── 📁 routes/                      # Definición de rutas
│   ├── admin.js                    # Rutas de administración
│   ├── auth.js                     # Rutas de autenticación
│   ├── authors.js                  # Rutas de autores
│   ├── books.js                    # Rutas de libros
│   ├── categories.js               # Rutas de categorías
│   ├── index.js                    # Rutas principales y perfil
│   └── publishers.js               # Rutas de editoriales
├── 📁 views/                       # Plantillas EJS
│   ├── 📁 admin/users/             # Administración de usuarios
│   ├── 📁 auth/                    # Páginas de autenticación
│   ├── 📁 authors/                 # Páginas de autores
│   ├── 📁 books/                   # Páginas de libros
│   ├── 📁 categories/              # Páginas de categorías
│   ├── 📁 layouts/                 # Plantillas base
│   ├── 📁 partials/                # Componentes reutilizables
│   ├── 📁 profile/                 # Páginas de perfil
│   └── 📁 publishers/              # Páginas de editoriales
├── app.js                          # Configuración principal de Express
├── package.json                    # Dependencias y scripts
├── database.sql                    # Esquema de base de datos
├── create-default-users.js         # Script para crear usuarios por defecto
├── check-database.js               # Script de verificación de BD
└── README.md                       # Documentación del proyecto
```

## Roles y Permisos

### 👑 Administrador (admin)
- **Acceso completo** al sistema
- Gestión de usuarios (crear, editar, activar/desactivar)
- Gestión de libros, autores, categorías y editoriales
- Configuración del sistema
- Ver estadísticas y reportes

### 👨‍💼 Bibliotecario (librarian)
- Gestión de libros, autores, categorías y editoriales
- Gestión de préstamos y devoluciones
- Ver usuarios (sin modificar)
- Reportes básicos

### 👤 Usuario (user)
- Ver catálogo de libros
- Realizar solicitudes de préstamo
- Gestionar su perfil personal
- Ver historial de préstamos

## API Endpoints

### 🔐 Autenticación (`/auth`)
- **GET** `/auth/login` - Mostrar formulario de login
- **POST** `/auth/login` - Procesar login
- **GET** `/auth/logout` - Cerrar sesión

### 👤 Perfil de Usuario (`/profile`)
- **GET** `/profile` - Ver perfil personal
- **GET** `/profile/edit` - Mostrar formulario de edición
- **POST** `/profile/edit` - Actualizar perfil
- **GET** `/profile/change-password` - Mostrar formulario de cambio de contraseña
- **POST** `/profile/change-password` - Cambiar contraseña

### 👥 Administración de Usuarios (`/admin/users`) *Solo Admin*
- **GET** `/admin/users` - Listar todos los usuarios
- **GET** `/admin/users/new` - Mostrar formulario de creación
- **POST** `/admin/users` - Crear nuevo usuario
- **GET** `/admin/users/:id/edit` - Mostrar formulario de edición
- **POST** `/admin/users/:id` - Actualizar usuario
- **POST** `/admin/users/:id/toggle-status` - Cambiar estado (activo/inactivo)

### 📚 Autores (`/authors`)
- **GET** `/authors` - Listar autores con paginación
- **GET** `/authors/new` - Mostrar formulario de creación
- **POST** `/authors` - Crear nuevo autor
- **GET** `/authors/:id/edit` - Mostrar formulario de edición
- **POST** `/authors/:id` - Actualizar autor
- **POST** `/authors/:id/delete` - Eliminar autor (soft delete)
- **POST** `/authors/toggle-state/:id` - Cambiar estado

### 📖 Libros (`/books`)
- **GET** `/books` - Listar libros con paginación y filtros
- **GET** `/books/new` - Mostrar formulario de creación
- **POST** `/books` - Crear nuevo libro
- **GET** `/books/:id/edit` - Mostrar formulario de edición
- **POST** `/books/:id` - Actualizar libro
- **POST** `/books/:id/delete` - Eliminar libro (soft delete)
- **POST** `/books/toggle-state/:id` - Cambiar estado

### 🏷️ Categorías (`/categories`)
- **GET** `/categories` - Listar categorías con paginación
- **GET** `/categories/new` - Mostrar formulario de creación
- **POST** `/categories` - Crear nueva categoría
- **GET** `/categories/:id/edit` - Mostrar formulario de edición
- **POST** `/categories/:id` - Actualizar categoría
- **POST** `/categories/:id/delete` - Eliminar categoría (soft delete)
- **POST** `/categories/toggle-state/:id` - Cambiar estado

### 🏢 Editoriales (`/publishers`)
- **GET** `/publishers` - Listar editoriales con paginación
- **GET** `/publishers/new` - Mostrar formulario de creación
- **POST** `/publishers` - Crear nueva editorial
- **GET** `/publishers/:id/edit` - Mostrar formulario de edición
- **POST** `/publishers/:id` - Actualizar editorial
- **POST** `/publishers/:id/delete` - Eliminar editorial (soft delete)
- **POST** `/publishers/toggle-state/:id` - Cambiar estado

## Funcionalidades Destacadas

### 🔒 Sistema de Seguridad
- **Autenticación**: Login seguro con sesiones
- **Autorización**: Control de acceso basado en roles
- **Encriptación**: Contraseñas protegidas con bcrypt
- **Middleware**: Protección de rutas sensibles

### 🎨 Interfaz de Usuario
- **Responsive**: Compatible con dispositivos móviles
- **Bootstrap 5**: Diseño moderno y profesional
- **Font Awesome**: Iconografía consistente
- **Flash Messages**: Feedback inmediato al usuario
- **Paginación**: Navegación eficiente en listas largas

### 📊 Panel de Administración
- **Gestión de Usuarios**: CRUD completo para usuarios
- **Estadísticas**: Vista resumida del sistema
- **Configuración**: Ajustes del sistema
- **Monitoreo**: Estado de la aplicación

### 🔔 Sistema de Notificaciones
- **Alertas**: Mensajes de éxito, error e información
- **Auto-dismiss**: Desaparición automática después de 5 segundos
- **Persistencia**: Mantiene mensajes entre redirecciones

## Instalación y Configuración

### Prerrequisitos

- **Node.js** v14 o superior
- **MySQL** v5.7 o superior
- **npm** (incluido con Node.js)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd nodejs-crud
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   - Crear una base de datos MySQL llamada `ejercicio_biblioteca_nodejs`
   - Importar el esquema desde `database.sql`:
   ```bash
   mysql -u root -p ejercicio_biblioteca_nodejs < database.sql
   ```

4. **Configurar variables de entorno** (opcional)
   - Crear archivo `.env` en la raíz del proyecto:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=ejercicio_biblioteca_nodejs
   PORT=3001
   SESSION_SECRET=tu_clave_secreta_aqui
   ```

5. **Crear usuarios por defecto**
   ```bash
   node create-default-users.js
   ```

6. **Iniciar la aplicación**
   ```bash
   npm start
   ```

7. **Acceder a la aplicación**
   - Abrir navegador en: `http://localhost:3001`

### Verificación de la Instalación

```bash
# Verificar estructura de la base de datos
node check-database.js

# Verificar usuarios creados
node check-users.js
```

## Usuarios por Defecto

Al ejecutar `create-default-users.js`, se crean los siguientes usuarios:

| Usuario    | Contraseña     | Rol          | Email                     |
|------------|----------------|--------------|---------------------------|
| admin      | admin123       | admin        | admin@biblioteca.com      |
| librarian  | librarian123   | librarian    | librarian@biblioteca.com  |
| usuario    | usuario123     | user         | usuario@biblioteca.com    |

## Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web para Node.js
- **MySQL2** - Driver para base de datos MySQL
- **EJS** - Motor de plantillas
- **bcryptjs** - Encriptación de contraseñas
- **express-session** - Manejo de sesiones
- **express-flash** - Mensajes flash
- **express-ejs-layouts** - Sistema de layouts

### Frontend
- **Bootstrap 5** - Framework CSS
- **Font Awesome** - Iconografía
- **JavaScript** - Interactividad del lado del cliente

### Dependencias

```json
{
  "bcryptjs": "^3.0.2",
  "cookie-parser": "~1.4.4",
  "debug": "~2.6.9",
  "ejs": "^3.1.10",
  "express": "^4.21.2",
  "express-ejs-layouts": "^2.5.1",
  "express-flash": "^0.0.2",
  "express-session": "^1.18.1",
  "http-errors": "~1.6.3",
  "method-override": "^3.0.0",
  "morgan": "~1.9.1",
  "mysql": "^2.18.1",
  "mysql2": "^3.14.1"
}
```

## Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| start | `npm start` | Inicia el servidor en producción |
| dev | `nodemon app.js` | Inicia el servidor en modo desarrollo |

## Scripts de Utilidad

| Script | Descripción |
|--------|-------------|
| `create-default-users.js` | Crea usuarios por defecto del sistema |
| `check-database.js` | Verifica la estructura de la base de datos |
| `check-users.js` | Verifica los usuarios existentes |
| `reset-password.js` | Herramienta para resetear contraseñas |

## Características Técnicas

### Arquitectura
- **Patrón MVC** (Model-View-Controller)
- **Middleware personalizado** para autenticación y notificaciones
- **Separación de responsabilidades** clara
- **Reutilización de componentes** con partials

### Seguridad
- **Protección CSRF** implícita con formularios
- **Validación de entrada** en servidor
- **Sanitización** de datos de usuario
- **Control de acceso** granular por roles

### Performance
- **Paginación** en todas las listas
- **Consultas optimizadas** a base de datos
- **Cache de sesiones** en memoria
- **Archivos estáticos** servidos eficientemente

## Desarrollo y Contribución

### Estructura de Desarrollo

```bash
# Instalar dependencias de desarrollo
npm install --save-dev nodemon

# Ejecutar en modo desarrollo
npx nodemon app.js
```

### Convenciones de Código
- **Nomenclatura**: camelCase para variables y funciones
- **Archivos**: kebab-case para nombres de archivo
- **Comentarios**: Documentación en español
- **Indentación**: 4 espacios

### Testing
```bash
# Verificar funcionamiento
node check-database.js
node check-users.js
```

## Resolución de Problemas

### Problemas Comunes

1. **Error de conexión a MySQL**
   - Verificar que MySQL esté ejecutándose
   - Comprobar credenciales en `lib/db.js`
   - Confirmar que la base de datos existe

2. **Puerto ya en uso**
   - Cambiar puerto en `bin/www`
   - Verificar procesos que usen el puerto 3001

3. **Usuarios no creados**
   - Ejecutar `node create-default-users.js`
   - Verificar con `node check-users.js`

### Logs de Depuración
El sistema incluye logs detallados para facilitar la depuración:
- Conexiones a base de datos
- Errores de autenticación
- Operaciones CRUD
- Estados de sesión

## Roadmap y Futuras Mejoras

### Funcionalidades Planeadas
- 📅 **Sistema de reservas** de libros
- 📊 **Dashboard** con estadísticas avanzadas
- 📧 **Notificaciones por email**
- 🔍 **Búsqueda avanzada** con filtros
- 📱 **API REST** para aplicaciones móviles
- 🌐 **Internacionalización** (i18n)

### Mejoras Técnicas
- **Tests unitarios** y de integración
- **Docker** para contenedorización
- **CI/CD** con GitHub Actions
- **Documentación** de API con Swagger
- **Monitoring** con herramientas especializadas

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto y Soporte

Para reportar bugs o solicitar nuevas funcionalidades, por favor crear un issue en el repositorio del proyecto.

---

**¡Gracias por usar el Sistema de Gestión de Biblioteca!** 📚✨