# 📨 Proyecto Base - Constructor de Emails con Fragmentos HTML

Quiero crear una aplicación web en **Next.js** (sin backend) que permita armar correos electrónicos a partir de fragmentos HTML almacenados en el proyecto. El objetivo es que el usuario pueda seleccionar un encabezado, múltiples secciones intermedias y un pie de página, y ver una **vista previa en vivo** del email generado.

---

## ⚙️ Tecnologías

- ✅ Next.js (con JavaScript)
- ✅ Sin backend
- ✅ Estilos simples con CSS
- ✅ HTML estáticos en `public/`

---

## 📁 Estructura del Proyecto

Por favor, generá un proyecto con la siguiente estructura mínima:

```
my-email-builder/
├── pages/
│   └── index.jsx
├── public/
│   └── emails/
│       ├── template-maestro.html
│       ├── headers/
│       │   └── header1.html
│       ├── sections/
│       │   ├── section1.html
│       │   └── section2.html
│       └── footers/
│           └── footer1.html
├── styles/
│   └── globals.css
├── package.json
└── README.md
```

---

## 🧩 Contenido de los Archivos HTML

### `/emails/template-maestro.html`

```html
<div class="email-container">
  %%HEADER%%
  %%SECTIONS%%
  %%FOOTER%%
</div>
```

### `/emails/headers/header1.html`

```html
<div class="email-header">
  <img src="%%LOGO_SRC%%" alt="%%LOGO_ALT%%" style="max-width: 100px;" />
  <p>%%HEADER_TEXT%%</p>
</div>
```

### `/emails/sections/section1.html`

```html
<div class="email-section">
  <h2>%%SECTION_TITLE%%</h2>
  <p>%%SECTION_BODY%%</p>
</div>
```

### `/emails/sections/section2.html`

```html
<div class="email-section">
  <img src="%%IMG_SRC%%" alt="%%IMG_ALT%%" title="%%IMG_TITLE%%" />
  <p>%%SECTION_TEXT%%</p>
</div>
```

### `/emails/footers/footer1.html`

```html
<div class="email-footer">
  <p>%%FOOTER_TEXT%%</p>
</div>
```

---

## 🖥️ Comportamiento Inicial Esperado

- La página principal debe permitir:
  - Seleccionar **un único encabezado** (`header1`) desde una lista.
  - Agregar **una o más secciones intermedias**, pudiendo elegir entre diferentes templates (`section1`, `section2`, etc.). Estas secciones pueden repetirse en cualquier orden.
  - Seleccionar **un único pie de página** (`footer1`) desde una lista.
- Cada fragmento (header, secciones, footer) debe cargarse como archivo HTML desde la ruta `/public/emails/...`.
- El archivo `template-maestro.html` debe contener los marcadores `%%HEADER%%`, `%%SECTIONS%%` y `%%FOOTER%%` que serán reemplazados por los fragmentos seleccionados.
- La sección `%%SECTIONS%%` puede contener múltiples secciones concatenadas.
- El resultado final debe renderizarse directamente con `dangerouslySetInnerHTML`, sin envolverlo en ningún `<div>` extra.
- La vista previa debe actualizarse **en tiempo real** a medida que se agregan o quitan bloques.
- Por ahora, **no se requiere edición dinámica** de los placeholders internos (como `%%IMG_SRC%%`, etc.). Eso se implementará en una segunda etapa.

---

## ✅ Resultado esperado

Una base sólida con Next.js que tenga la estructura y el renderizado de fragmentos funcional. Sin backend, sin datos externos. Todo contenido estático y controlado.
