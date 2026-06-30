const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'assets', 'Kubernetes Notes');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let inBox = false;
  let boxStart = -1;

  function fixBox(start, end) {
    let maxW = 0;
    for(let i = start; i <= end; i++) {
      const line = lines[i];
      const match = line.match(/(.*)([┐│┤┘])\s*$/);
      if(match) {
        let len = Array.from(line).length;
        if (len > maxW) maxW = len;
      }
    }
    for(let i = start; i <= end; i++) {
      const line = lines[i];
      const match = line.match(/^(.*?)([┐│┤┘])(\s*)$/);
      if(match) {
        let currentLen = Array.from(line).length;
        if (currentLen < maxW) {
           let diff = maxW - currentLen;
           let chars = Array.from(match[1]);
           let padChar = ' ';
           if (['┐', '┘', '┤'].includes(match[2]) && chars.includes('─')) padChar = '─';
           lines[i] = chars.join('') + padChar.repeat(diff) + match[2] + match[3];
        }
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^[ \t]*[┌│├└]/.test(line) && /[┐│┤┘]\s*$/.test(line)) {
      if (!inBox) { inBox = true; boxStart = i; }
    } else {
      if (inBox) { fixBox(boxStart, i - 1); inBox = false; }
    }
  }
  if (inBox) fixBox(boxStart, lines.length - 1);

  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`Aligned ASCII diagrams in ${file}`);
}
