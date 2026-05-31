import os
import shutil
import pandas as pd
from datetime import datetime

DIRECTORY = r"c:\Users\diega\OneDrive\Escritorio\202411_b\vet"
INVENTORY_CSV = os.path.join(DIRECTORY, "inventory.csv")
OUTPUT_DIR = os.path.join(DIRECTORY, "Clasificados")

def main():
    if not os.path.exists(INVENTORY_CSV):
        print("Error: No se encontró inventory.csv. Debes ejecutar las fases anteriores primero.")
        return
        
    df = pd.read_csv(INVENTORY_CSV)
    
    print("Iniciando simulación de organización de archivos...")
    
    # Crear log de simulación
    log_lines = ["--- SIMULACIÓN DE COPIADO ---"]
    
    moves = []
    
    for _, row in df.iterrows():
        filename = row['Filename']
        src_path = os.path.join(DIRECTORY, filename)
        
        # Omitir si el archivo original no existe (por si acaso)
        if not os.path.exists(src_path) or filename in ['inventory.csv', 'extract_metadata.py', 'analyze_content.py', 'organizer.py']:
            continue
            
        category = str(row.get('Category_AI', 'Desconocido')).strip()
        # Limpiar categoría de caracteres no válidos para carpetas
        safe_category = "".join(c for c in category if c.isalnum() or c in (' ', '-', '_')).strip()
        if not safe_category:
            safe_category = "Desconocido"
            
        # Extraer Fecha (usar Metadata Date si existe, si no OS Date)
        date_str = str(row.get('Metadata_Creation_Date', ''))
        if date_str == 'nan' or not date_str:
            date_str = str(row.get('OS_Creation_Date', ''))
            
        year = "Desconocido"
        month = "Desconocido"
        
        try:
            # Intentar parsear fecha (asumiendo formato YYYY:MM:DD o YYYY-MM-DD)
            if ':' in date_str and '-' not in date_str[:10]:
                dt = datetime.strptime(date_str[:10], '%Y:%m:%d')
            else:
                dt = datetime.strptime(date_str[:10], '%Y-%m-%d')
            year = str(dt.year)
            month = dt.strftime('%B').capitalize() # Nombre del mes
        except:
            pass # Mantener "Desconocido"
            
        # Destino: Clasificados / Categoria / Año / Mes
        dest_dir = os.path.join(OUTPUT_DIR, safe_category, year, month)
        dest_path = os.path.join(dest_dir, filename)
        
        moves.append((src_path, dest_dir, dest_path, filename))
        log_lines.append(f"ORIGEN: {filename} --> DESTINO: {os.path.join(safe_category, year, month)}")

    # Guardar log de simulación
    log_path = os.path.join(DIRECTORY, "copy_simulation_log.txt")
    with open(log_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(log_lines))
        
    print(f"Simulación completada. Por favor revisa {log_path}.")
    
    print("Iniciando copiado real...")
    copied = 0
    for src, dest_dir, dest_path, fname in moves:
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        
        try:
            shutil.copy2(src, dest_path)
            copied += 1
            if copied % 50 == 0:
                print(f"Copiados {copied}/{len(moves)}...")
        except Exception as e:
            print(f"Error copiando {fname}: {e}")
            
    print(f"Copiado finalizado. {copied} archivos copiados a la carpeta 'Clasificados'.")

if __name__ == "__main__":
    main()
