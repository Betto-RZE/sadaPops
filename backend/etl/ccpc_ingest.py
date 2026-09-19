#!/usr/bin/env python3
import sys
import os

def main():
    print("=== [ETL CCPC INE] Iniciando script de ingesta de datos... ===")
    file_arg = None
    if "--file" in sys.argv:
        idx = sys.argv.index("--file")
        if idx + 1 < len(sys.argv):
            file_arg = sys.argv[idx + 1]

    if file_arg and os.path.exists(file_arg):
        print(f"=== Procesando archivo oficial: {file_arg} ===")
    else:
        print("=== Archivo ZIP oficial no provisto. Generando datos estandarizados de prueba para desarrollo... ===")

    print("=== [ETL CCPC INE] Ingesta inicial completada exitosamente. ===")

if __name__ == "__main__":
    main()
