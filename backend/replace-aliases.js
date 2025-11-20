import fs from 'fs';
import path from 'path';
import glob from 'glob';

const aliases = {
  "./config": './config',
  "./src": './src',
  "./src/repository": './src/repository',
  "./src/session": './src/session',
  "./src/security": './src/security',
  "./src/dbms": './src/dbms',
  "./src/mailer": './src/mailer',
  "./src/tokenizer": './src/tokenizer',
  "./src/validator": './src/validator',
  "./src/debugger": './src/debugger',
  "./src/utils": './src/utils',
  "./src/dispatcher": './src/dispatcher',
  "./src/formatter": './src/formatter',
  "./src/_business": './src/_business',
  "./src/_business/atx": './src/_business/atx',
  "./src/_business/bo": './src/_business/bo',
  "./ftx/services": './ftx/services',
  "./src/_business/backer-scm": './src/_business/backer-scm',
  "./src/_business/ftx": './src/_business/ftx',
};

// Encuentra todos los archivos JS en el proyecto, ignorando node_modules y dist
const files = glob.sync('**/*.js', { ignore: ['node_modules/**', 'dist/**'] });

for (const file of files) {
  const fullPath = path.resolve(file);
  let content = fs.readFileSync(fullPath, 'utf8');
  let newContent = content;

  for (const [alias, targetPath] of Object.entries(aliases)) {
    const regex = new RegExp(`['"]${alias}(/[^'"]*)?['"]`, 'g');

    newContent = newContent.replace(regex, (match, p1) => {
      const importPath = p1 || '';
      // Calcula ruta relativa desde el archivo actual
      const absoluteTarget = path.resolve(targetPath, importPath.slice(1));
      let relativePath = path.relative(path.dirname(fullPath), absoluteTarget);

      // Asegúrate de usar './' al inicio si no es absoluta
      if (!relativePath.startsWith('.')) relativePath = './' + relativePath;

      // Usa slash normal en lugar de backslash en Windows
      relativePath = relativePath.split(path.sep).join('/');

      return `"${relativePath}"`;
    });
  }

  if (newContent !== content) {
    console.log('Rewriting', file);
    fs.writeFileSync(fullPath, newContent, 'utf8');
  }
}

console.log('Done.');
