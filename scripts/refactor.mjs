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

  // Backgrounds
  content = content.replace(/\bbg-slate-50\b/g, 'bg-background');
  content = content.replace(/\bbg-white\b/g, 'bg-card');
  content = content.replace(/\bbg-slate-100\b/g, 'bg-muted');
  content = content.replace(/\bbg-slate-900\b/g, 'bg-foreground');

  // Text
  content = content.replace(/\btext-slate-900\b/g, 'text-foreground');
  content = content.replace(/\btext-slate-800\b/g, 'text-foreground');
  content = content.replace(/\btext-slate-700\b/g, 'text-card-foreground');
  content = content.replace(/\btext-slate-600\b/g, 'text-muted-foreground');
  content = content.replace(/\btext-slate-500\b/g, 'text-muted-foreground');
  content = content.replace(/\btext-slate-400\b/g, 'text-muted-foreground');

  // Borders
  content = content.replace(/\bborder-slate-200\b/g, 'border-border');
  content = content.replace(/\bborder-slate-100\b/g, 'border-border/50');
  content = content.replace(/\bborder-slate-300\b/g, 'border-border');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    totalChanges++;
  }
});

console.log(`Updated colors in ${totalChanges} files.`);
