import fitz  # PyMuPDF
import re
import sys
import os

pdf_path = r"C:\Users\shubham\Downloads\gitgithubnotes\Terraform Notes Complete.pdf"
target_path = r"C:\Users\shubham\Downloads\gitgithubnotes\web-app\src\Terraform_Complete_Notes.md"

def extract_pdf():
    print(f"Opening {pdf_path}...")
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"Error opening PDF: {e}")
        sys.exit(1)

    extracted_text = "\n\n# --- EXTRACTED PDF CONTENT (Complete Depth) ---\n\n"
    
    print("Extracting pages...")
    for page_num, page in enumerate(doc):
        text = page.get_text()
        
        # Apply some basic markdown formatting heuristics
        # Make things that look like headers actual markdown headers
        lines = text.split('\n')
        formatted_lines = []
        for line in lines:
            stripped = line.strip()
            # If line starts with a number followed by dot (e.g. "1. Introduction")
            if re.match(r'^\d+\.\s+[A-Z]', stripped):
                formatted_lines.append(f"\n## {stripped}\n")
            # If line starts with a letter followed by dot (e.g. "a. What is...")
            elif re.match(r'^[a-z]\.\s+[A-Z]', stripped):
                formatted_lines.append(f"\n### {stripped}\n")
            else:
                formatted_lines.append(stripped)
        
        page_text = "\n".join(formatted_lines)
        
        extracted_text += page_text + "\n\n"
        
    print(f"Extracted {len(extracted_text)} characters.")
    
    print(f"Appending to {target_path}...")
    with open(target_path, "a", encoding="utf-8") as f:
        f.write(extracted_text)
        
    print("Done!")

if __name__ == "__main__":
    extract_pdf()
