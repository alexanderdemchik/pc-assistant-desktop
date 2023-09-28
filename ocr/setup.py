import sys
from cx_Freeze import setup, Executable

setup(
    name = "ocr",
    version = "0.1",
    description = "OCR Lib",
    options = {"build_exe": { "packages": ["easyocr", "skimage", "imageio"], "build_exe": "./ocr-build" }},
    executables = [Executable("ocr.py")])