/**
 * Genera dist/offline.html autocontenido para abrir con doble clic.
 * El build normal (dist/index.html) queda intacto para GitHub Pages.
 */
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html no existe. Ejecutá npm run build primero.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf-8');

const MIME = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

function fileToDataUri(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext];
  if (!mime || !fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function resolveDistPath(url) {
  return path.resolve(distDir, url.replace(/^\.\//, '').replace(/^\//, ''));
}

const cssMatch = html.match(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/i);
if (cssMatch) {
  const cssPath = resolveDistPath(cssMatch[1]);
  let css = fs.readFileSync(cssPath, 'utf-8');
  css = css.replace(
    /url\((?:'|")?(\.\/)?([^'")]+\.(?:woff2|woff|svg|png|jpg|jpeg))(?:'|")?\)/g,
    (match, _prefix, relativePath) => {
      const assetPath = path.join(path.dirname(cssPath), relativePath);
      const uri = fileToDataUri(assetPath);
      return uri ? `url("${uri}")` : match;
    }
  );
  html = html.replace(cssMatch[0], () => `<style>\n${css}\n</style>`);
}

const jsMatch = html.match(/<script type="module"[^>]*src="([^"]+\.js)"[^>]*><\/script>/i);
if (jsMatch) {
  const jsPath = resolveDistPath(jsMatch[1]);
  const js = fs.readFileSync(jsPath, 'utf-8').replace(/<\/script/gi, '<\\/script');
  html = html.replace(jsMatch[0], () => `<script>\n${js}\n</script>`);
}

const iconMatch = html.match(/<link rel="icon"[^>]*href="([^"]+)"[^>]*>/i);
if (iconMatch) {
  const iconPath = resolveDistPath(iconMatch[1]);
  const uri = fileToDataUri(iconPath);
  if (uri) {
    html = html.replace(iconMatch[0], () => `<link rel="icon" type="image/svg+xml" href="${uri}" />`);
  }
}

html = html.replace(/\s+crossorigin(?:="[^"]*")?/g, '');

const outputPath = path.join(distDir, 'offline.html');
fs.writeFileSync(outputPath, html, 'utf-8');
console.log(`Build offline generado en ${outputPath}`);
