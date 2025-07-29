import os
import zipfile
from docx import Document
from typing import List
from datetime import datetime


def zip_files(file_paths: List[str], zip_name: str) -> str:
    zip_path = os.path.join("generated", zip_name)
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for file in file_paths:
            zipf.write(file, arcname=os.path.basename(file))
    return zip_path
