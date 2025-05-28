# Aplicación CRUD (Node.js + Express + EJS + MySQL)

## Descripción

Esta aplicación es un CRUD (Create, Read, Update, Delete) para gestionar autores, categorías y editoriales (publishers) de una biblioteca. Está desarrollada con Node.js, Express, EJS (motor de plantillas) y MySQL. La interfaz de usuario se construye con Bootstrap y Font Awesome, y se implementa un sistema de autenticación (login) y autorización (roles) para proteger las rutas de administración.

## Estructura de la Base de Datos

### Tabla `authors`

| Campo      | Tipo de dato | Descripción                        |
|------------|--------------|------------------------------------|
| id_author  | INT (PK)     | Identificador único del autor (autoincremental) |
| name       | VARCHAR      | Nombre del autor                   |
| state      | TINYINT/INT  | Estado (1 = Activo, 0 = Inactivo)  |

### Tabla `categories`

| Campo         | Tipo de dato | Descripción                        |
|---------------|--------------|------------------------------------|
| id_category   | INT (PK)     | Identificador único de la categoría (autoincremental) |
| name          | VARCHAR      | Nombre de la categoría             |
| state         | TINYINT/INT  | Estado (1 = Activo, 0 = Inactivo)  |

### Tabla `publishers`

| Campo           | Tipo de dato | Descripción                        |
|-----------------|--------------|------------------------------------|
| id_publisher    | INT (PK)     | Identificador único de la editorial (autoincremental) |
| name            | VARCHAR      | Nombre de la editorial             |
| state           | TINYINT/INT  | Estado (1 = Activo, 0 = Inactivo)  |

## Estructura del Proyecto

- **nodejs-crud/**: Carpeta raíz del proyecto.
  - **controllers/**: Controladores (authorController, categoryController, publisherController, authController, etc.) que manejan la lógica de negocio.
  - **routes/**: Rutas (authors, categories, publishers, auth, etc.) que definen los endpoints de la API.
  - **views/**: Plantillas EJS (por ejemplo, `authors/index.ejs`, `categories/index.ejs`, `publishers/index.ejs`, `login.ejs`, etc.) que renderizan la interfaz de usuario.
  - **config/**: Configuración (por ejemplo, conexión a la base de datos).
  - **public/**: Archivos estáticos (CSS, JS, imágenes, etc.).
  - **app.js**: Archivo principal que inicia el servidor y monta los middlewares (express, sesiones, autenticación, etc.).
  - **package.json**: Dependencias y scripts (por ejemplo, `npm start`).
  - **.env**: Variables de entorno (por ejemplo, credenciales de la base de datos, puerto, etc.).

## Rutas (Endpoints)

### Autores (`/authors`)

- **GET /authors**: Muestra la lista de autores (vista: `views/authors/index.ejs`).
- **GET /authors/new**: Muestra el formulario para crear un nuevo autor (vista: `views/authors/new.ejs`).
- **POST /authors**: Crea un nuevo autor (controlador: `AuthorController.createAuthor`).
- **GET /authors/:id/edit**: Muestra el formulario para editar un autor (vista: `views/authors/edit.ejs`).
- **POST /authors/:id**: Actualiza un autor (controlador: `AuthorController.updateAuthor`).
- **POST /authors/:id/delete**: Elimina (soft-delete) un autor (controlador: `AuthorController.deleteAuthor`).
- **POST /authors/toggle-state/:id_author**: Cambia el estado (activo/inactivo) de un autor (controlador: `AuthorController.toggleState`).

### Categorías (`/categories`)

- **GET /categories**: Muestra la lista de categorías (vista: `views/categories/index.ejs`).
- **GET /categories/new**: Muestra el formulario para crear una nueva categoría (vista: `views/categories/new.ejs`).
- **POST /categories**: Crea una nueva categoría (controlador: `CategoryController.createCategory`).
- **GET /categories/:id/edit**: Muestra el formulario para editar una categoría (vista: `views/categories/edit.ejs`).
- **POST /categories/:id**: Actualiza una categoría (controlador: `CategoryController.updateCategory`).
- **POST /categories/:id/delete**: Elimina (soft-delete) una categoría (controlador: `CategoryController.deleteCategory`).
- **POST /categories/toggle-state/:id_category**: Cambia el estado (activo/inactivo) de una categoría (controlador: `CategoryController.toggleState`).

### Editoriales (`/publishers`)

- **GET /publishers**: Muestra la lista de editoriales (vista: `views/publishers/index.ejs`).
- **GET /publishers/new**: Muestra el formulario para crear una nueva editorial (vista: `views/publishers/new.ejs`).
- **POST /publishers**: Crea una nueva editorial (controlador: `PublisherController.createPublisher`).
- **GET /publishers/:id/edit**: Muestra el formulario para editar una editorial (vista: `views/publishers/edit.ejs`).
- **POST /publishers/:id**: Actualiza una editorial (controlador: `PublisherController.updatePublisher`).
- **POST /publishers/:id/delete**: Elimina (soft-delete) una editorial (controlador: `PublisherController.deletePublisher`).
- **POST /publishers/toggle-state/:id_publisher**: Cambia el estado (activo/inactivo) de una editorial (controlador: `PublisherController.toggleState`).

### Autenticación (`/auth`)

- **GET /auth/login**: Muestra la página de login (vista: `views/auth/login.ejs`).
- **POST /auth/login**: Autentica al usuario (controlador: `AuthController.login`).
- **GET /auth/logout**: Cierra la sesión (controlador: `AuthController.logout`).

## Controladores

- **AuthorController**: Gestiona la lógica de autores (crear, listar, editar, eliminar, toggle-state).
- **CategoryController**: Gestiona la lógica de categorías (crear, listar, editar, eliminar, toggle-state).
- **PublisherController**: Gestiona la lógica de editoriales (crear, listar, editar, eliminar, toggle-state).
- **AuthController**: Gestiona la autenticación (login, logout).

## Vistas (EJS)

- **views/authors/index.ejs**: Lista de autores (con botones para editar, eliminar y cambiar estado).
- **views/authors/new.ejs**: Formulario para crear un nuevo autor.
- **views/authors/edit.ejs**: Formulario para editar un autor.
- **views/categories/index.ejs**: Lista de categorías (con botones para editar, eliminar y cambiar estado).
- **views/categories/new.ejs**: Formulario para crear una nueva categoría.
- **views/categories/edit.ejs**: Formulario para editar una categoría.
- **views/publishers/index.ejs**: Lista de editoriales (con botones para editar, eliminar y cambiar estado).
- **views/publishers/new.ejs**: Formulario para crear una nueva editorial.
- **views/publishers/edit.ejs**: Formulario para editar una editorial.
- **views/auth/login.ejs**: Página de login.
- **views/layouts/main.ejs**: Plantilla base (header, footer, barra de navegación, etc.).

## Ejecución de la Aplicación

1. **Clonar el repositorio** (o descargar el código).
2. **Instalar dependencias** (en la carpeta raíz del proyecto):
   ```bash
   npm install
   ```
3. **Configurar la base de datos** (crear un archivo `.env` con las credenciales de MySQL, puerto, etc.).
4. **Iniciar el servidor**:
   ```bash
   npm start
   ```
   (o bien, si se usa nodemon, ejecutar `nodemon app.js`).
5. **Acceder a la aplicación** en el navegador (por ejemplo, `http://localhost:3001`).

## Tecnologías Utilizadas

- **Backend**: Node.js, Express, MySQL (con el módulo `mysql2`).
- **Frontend**: EJS (motor de plantillas), Bootstrap (CSS y JS), Font Awesome (iconos).
- **Autenticación**: Sesiones (express-session), middleware de autenticación (`isAuthenticated`) y autorización (`hasRole`).

---

Este README resume la estructura, rutas, controladores, vistas y la forma de ejecutar la aplicación. Si necesitas más detalles o ejemplos de código, revisa los archivos correspondientes en el proyecto. 