// createComponent.js
const fs = require("fs");
const path = require("path");

const componentName = process.argv[2];
if (!componentName) {
  console.error("❌ Debes indicar el nombre de la pagina. Ej: node createpage Login");
  process.exit(1);
}
if (!/^[A-Z]/.test(componentName)) { // Primera letra mayúscula
  console.error("❌ El nombre de la pagina debe comenzar con mayúscula. Ej: Login");
  process.exit(1);

}
// Rutas preestablecidas
const baseDirJsx = path.join(__dirname, "src", "Page", componentName);
const baseDirCss = path.join(__dirname, "src", "Page/CSS", componentName);
const jsxFile = path.join(baseDirJsx, `${componentName}.jsx`);
const cssFile = path.join(baseDirCss, `${componentName}.css`);

// Crear carpeta si no existe
if (!fs.existsSync(baseDirJsx)) {
  fs.mkdirSync(baseDirJsx, { recursive: true });
}
if (!fs.existsSync(baseDirCss)) {
  fs.mkdirSync(baseDirCss, { recursive: true });
}

// Template JSX
const jsxTemplate = `import React from "react";
import "./${componentName}.css";

export default function ${componentName}() {
  return (
    <div className="${componentName.toLowerCase()}-container">
      <h1>${componentName} Page</h1>
    </div>
  );
}
`;

// Template CSS
const cssTemplate = `.${componentName.toLowerCase()}-container {
  padding: 20px;
}
`;

// Crear archivos
fs.writeFileSync(jsxFile, jsxTemplate, "utf8");
fs.writeFileSync(cssFile, cssTemplate, "utf8");

console.log(`✅ Componente ${componentName} creado en ${baseDirJsx} y ${baseDirCss}`);
