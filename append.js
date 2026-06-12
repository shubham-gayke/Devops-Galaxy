import fs from 'fs';
fs.appendFileSync('src/Terraform_Complete_Notes.md', '\n\n' + fs.readFileSync('src/interview_questions.md', 'utf-8'));
console.log("Appended successfully");
