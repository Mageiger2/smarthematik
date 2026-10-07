// Übersetzt JSX (stdin) mit dem mitgelieferten Babel in normales JavaScript (stdout).
// Wird von tools/build_scorm.py aufgerufen: node tools/jsx_compile.js < eingabe > ausgabe
const fs = require('fs');
const path = require('path');
const Babel = require(path.join(__dirname, '..', 'assets', 'vendor', 'babel.min.js'));
const src = fs.readFileSync(0, 'utf8');
const out = Babel.transform(src, { presets: ['react'], sourceType: 'script', compact: false, comments: false });
process.stdout.write(out.code);
