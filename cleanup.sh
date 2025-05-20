#!/bin/bash

# Script para limpiar archivos innecesarios en la aplicación

# Eliminar archivos de respaldo y archivos temporales
find . -name "*.bak" -type f -delete
find . -name "*~" -type f -delete
find . -name ".DS_Store" -type f -delete

# Eliminar archivos de index antiguos o duplicados
rm -f views/books/nuevo-index.ejs
rm -f views/books/index-corrected.ejs

echo "Limpieza de archivos completada."
