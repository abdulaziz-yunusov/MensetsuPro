import fs from 'fs';
import path from 'path';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

const allTSXFiles = getAllFiles(path.join(process.cwd(), 'src'));

const colorPattern = /(bg-|text-|border-|ring-)(white|slate|gray|zinc|neutral|stone)-?(\d+)?(\/[0-9]+)?/g;
const counts = {};

allTSXFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = colorPattern.exec(content)) !== null) {
    const cls = match[0];
    counts[cls] = (counts[cls] || 0) + 1;
  }
});

const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
console.log(sorted.slice(0, 30));
