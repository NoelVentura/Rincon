# Carpeta de Fuentes

Coloca aquí todas las fuentes personalizadas que quieras usar en el sitio web.

## Formatos de fuentes soportados:

- **WOFF2** - Recomendado (mejor compresión y soporte)
- **WOFF** - Buena compatibilidad
- **TTF/OTF** - Formatos estándar
- **EOT** - Para compatibilidad con Internet Explorer (opcional)

## Cómo usar las fuentes:

1. Coloca tus archivos de fuente en esta carpeta
2. En el archivo HTML, agrega `@font-face` en la sección `<style>`:

```css
@font-face {
    font-family: 'NombreDeTuFuente';
    src: url('fonts/tu-fuente.woff2') format('woff2'),
         url('fonts/tu-fuente.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
```

3. Usa la fuente en tus estilos:

```css
body {
    font-family: 'NombreDeTuFuente', sans-serif;
}
```

## Ejemplo de estructura:

```
fonts/
├── README.md
├── fuente-regular.woff2
├── fuente-bold.woff2
└── fuente-italic.woff2
```




















