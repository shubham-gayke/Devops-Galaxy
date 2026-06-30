const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'assets', 'Kubernetes Notes');
const destFile = path.join(__dirname, 'public', 'content', 'kubernetes.md');

const files = [
  'kubernetes-guide-part1.md',
  'kubernetes-guide-part2.md',
  'kubernetes-guide-part3.md',
  'kubernetes-guide-part4.md',
  'kubernetes-guide-part5.md'
];

let finalContent = '';
let currentChapter = 0;
let currentChapterTitle = '';

for (const file of files) {
  const filePath = path.join(srcDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Look for Chapter headings: # Chapter X: Title
    const chapterMatch = line.match(/^#\s+Chapter\s+(\d+):\s+(.*)/i);
    if (chapterMatch) {
      currentChapter = parseInt(chapterMatch[1], 10);
      currentChapterTitle = chapterMatch[2];
      // Convert to ## X. Title so useToc parses it as a top-level chapter
      line = `## ${currentChapter}. ${currentChapterTitle}`;
      finalContent += line + '\n';
      continue;
    } else if (line.match(/^#\s+Chapter\s+(\d+)/i)) {
      // Handle cases where the title might not be on the same line or is missing a colon
      const fallbackMatch = line.match(/^#\s+Chapter\s+(\d+)\s*(.*)/i);
      if (fallbackMatch) {
         currentChapter = parseInt(fallbackMatch[1], 10);
         currentChapterTitle = fallbackMatch[2].replace(/^[-:]\s*/, '');
         line = `## ${currentChapter}. ${currentChapterTitle}`;
         finalContent += line + '\n';
         continue;
      }
    }
    
    // Look for sub-headings: ## X. Title
    if (currentChapter > 0) {
      const subHeadingMatch = line.match(/^##\s+(\d+)\.\s+(.*)/);
      if (subHeadingMatch) {
        // Convert to ### X.Y Title so useToc parses it as a child of the chapter
        line = `### ${currentChapter}.${subHeadingMatch[1]} ${subHeadingMatch[2]}`;
      }
    }
    
    finalContent += line + '\n';
  }
}

fs.writeFileSync(destFile, finalContent, 'utf8');
console.log('Successfully generated kubernetes.md with fixed headings');
