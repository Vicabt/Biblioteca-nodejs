# Gestión de Biblioteca - Instrucciones de Autenticación

Esta aplicación web permite gestionar una biblioteca con libros, autores, categorías y editoriales. A continuación, se detallan las instrucciones para manejar la autenticación.

## Usuarios por defecto

La aplicación viene con tres usuarios predefinidos:

1. **Administrador**
   - Usuario: `admin`
   - Contraseña: `admin123`
   - Rol: Administrador

2. **Bibliotecario**
   - Usuario: `librarian`
   - Contraseña: `librarian123`
   - Rol: Bibliotecario

3. **Usuario**
   - Usuario: `usuario`
   - Contraseña: `usuario123`
   - Rol: Usuario

## Solución a problemas de autenticación

Si tienes problemas para iniciar sesión, puedes usar los siguientes scripts para solucionar los problemas:

### Restablecer contraseña de administrador

Si no puedes acceder con las credenciales del administrador, ejecuta el siguiente comando:

```bash
node reset-password.js
```

Esto restablecerá la contraseña del usuario "admin" a "admin123".

### Crear un nuevo usuario

Si necesitas crear un nuevo usuario, modifica los datos en el archivo `create-user.js` según tus necesidades y luego ejecuta:

```bash
node create-user.js
```

## Roles y permisos

1. **Administrador**: Acceso completo a todas las funciones de la aplicación.
2. **Bibliotecario**: Puede gestionar libros, autores, categorías y editoriales.
3. **Usuario**: Puede navegar por el catálogo y solicitar préstamos de libros.

## Contacto para soporte

Si sigues teniendo problemas, contacta al administrador del sistema.
