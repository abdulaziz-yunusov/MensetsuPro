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

let totalChanges = 0;

allTSXFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/\btext-slate-950\b/g, 'text-foreground');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    totalChanges++;
  }
});

console.log(`Updated text-slate-950 in ${totalChanges} files.`);
