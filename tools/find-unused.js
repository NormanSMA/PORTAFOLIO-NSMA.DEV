import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '../src');

function walk(dir) {
  let files = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) files = files.concat(walk(full));
    else if (/\.tsx?$/.test(full)) files.push(full);
  }
  return files;
}

const files = walk(SRC);
const contents = files.map(f => ({ path: f, text: fs.readFileSync(f, 'utf8') }));

function basenameNoExt(p) {
  return path.basename(p).replace(/\.[^.]+$/, '');
}

const results = [];
for (const f of files) {
  const name = basenameNoExt(f);
  let count = 0;
  for (const c of contents) {
    if (c.path === f) continue;
    if (c.text.includes(name)) count++;
  }
  if (count === 0) results.push({ file: f, name });
}

console.log(JSON.stringify({ totalFiles: files.length, candidates: results }, null, 2));
