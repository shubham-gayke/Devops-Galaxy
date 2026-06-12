import fs from 'fs';

const transcriptPath = 'C:\\Users\\shubham\\.gemini\\antigravity-ide\\brain\\35f6e5a3-abdc-4199-b5ae-019836311733\\.system_generated\\logs\\transcript.jsonl';
const targetFilePath = 'C:\\Users\\shubham\\Downloads\\gitgithubnotes\\web-app\\src\\Terraform_Complete_Notes.md';

const content = fs.readFileSync(transcriptPath, 'utf-8');
const lines = content.split('\n');

let extractedText = '';

for (const line of lines) {
    if (!line) continue;
    try {
        const data = JSON.parse(line);
        if (data.type === 'TOOL_RESPONSE' && data.tool_calls) {
            for (const call of data.tool_calls) {
                if (call.function_name === 'default_api:view_file' && call.response && call.response.output) {
                    const output = call.response.output;
                    if (output.includes('==Start of OCR')) {
                        // Extract text using regex
                        const regex = /==Start of OCR for page \d+==\r?\n([\s\S]*?)\r?\n==End of OCR for page \d+==/g;
                        let match;
                        while ((match = regex.exec(output)) !== null) {
                            let pageText = match[1];
                            
                            // Basic heading formatting
                            pageText = pageText.replace(/^(\d+\.\s+[A-Z].+)$/gm, '## $1');
                            pageText = pageText.replace(/^([a-z]\.\s+[A-Z].+)$/gm, '### $1');
                            
                            // Fix some spacing issues from OCR
                            pageText = pageText.replace(/\r\n/g, '\n');
                            
                            extractedText += pageText + '\n\n';
                        }
                    }
                }
            }
        }
    } catch (e) {
        // ignore JSON parse errors on malformed lines
    }
}

if (extractedText) {
    extractedText = '\n\n# --- EXTRACTED PDF CONTENT (Full Depth) ---\n\n' + extractedText;
    fs.appendFileSync(targetFilePath, extractedText);
    console.log('Appended ' + extractedText.length + ' characters to ' + targetFilePath);
} else {
    console.log('No OCR text found. Attempting fallback text search...');
}
