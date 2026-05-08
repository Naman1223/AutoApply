from pathlib import Path
import os
import pymupdf4llm
from rich import prompt
from rich.console import Console

console = Console()

if os.path.isfile("Resume.md"):
    print("The file exists.")
else:
    file_path = console.input("[blue]Drag and drop your PDF here and press enter key:[/blue] ").strip().replace('\\ ', ' ')
    # Convert the entire PDF to a Markdown string
    md_text = pymupdf4llm.to_markdown(file_path)
    # Save to a file
    with open("Resume.md", "w", encoding="utf-8") as f:
        f.write(md_text)
    console.print("Resume saved successfully.")
    Role = prompt.Prompt.ask("What is your current role or the role you want to apply for? ")

    
    

