#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('Building SiniestrosAI for production...\n');

function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s*!important/g, '!important')
    .trim();
}

function minifyJS(js) {
  // Basic minification: remove comments, collapse whitespace in safe areas
  return js
    .replace(/\/\/(?!['"]).*$/gm, '') // single-line comments (not in strings)
    .replace(/\/\*[\s\S]*?\*\//g, '') // multi-line comments
    .replace(/\n\s*\n/g, '\n')       // blank lines
    .replace(/^\s+/gm, '')           // leading whitespace
    .trim();
}

// Minify CSS
const cssPath = path.join(__dirname, 'styles.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  const minified = minifyCSS(css);
  fs.writeFileSync(path.join(__dirname, 'styles.min.css'), minified);
  const saved = ((1 - minified.length / css.length) * 100).toFixed(1);
  console.log(`styles.css: ${css.length} -> ${minified.length} bytes (${saved}% reduction)`);
}

// Minify JS
const jsPath = path.join(__dirname, 'app.js');
if (fs.existsSync(jsPath)) {
  const js = fs.readFileSync(jsPath, 'utf8');
  const minified = minifyJS(js);
  fs.writeFileSync(path.join(__dirname, 'app.min.js'), minified);
  const saved = ((1 - minified.length / js.length) * 100).toFixed(1);
  console.log(`app.js: ${js.length} -> ${minified.length} bytes (${saved}% reduction)`);
}

console.log('\nBuild complete. Use .min files in production.');
