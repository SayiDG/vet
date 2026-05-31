import os
import subprocess
import pandas as pd
from google import genai
from google.genai import types
from concurrent.futures import ThreadPoolExecutor, as_completed
import base64

DIRECTORY = r"c:\Users\diega\OneDrive\Escritorio\202411_b\vet"
INVENTORY_CSV = os.path.join(DIRECTORY, "inventory.csv")
TEMP_FRAMES_DIR = os.path.join(DIRECTORY, "temp_frames")

# Añadir ruta de ffmpeg al PATH del entorno
ffmpeg_path = r"C:\Users\diega\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-essentials_build\bin"
os.environ["PATH"] += os.pathsep + ffmpeg_path

# GCP Project details
PROJECT_ID = "project-045007f9-8364-44d0-912"
LOCATION = "us-central1"

# Prompt para clasificar
PROMPT = """Eres un asistente especializado en veterinaria. Analiza esta imagen extraída de un archivo y clasifícala en UNA de las siguientes categorías principales:
- Cirugías
- Consultas / Examen
- Especies (si solo se ve el animal)
- Instalaciones
- Promocional
- Personal / Selfie
- Otro

Devuelve ÚNICAMENTE el nombre de la categoría. Si es una especie, devuelve "Especies: [Nombre del Animal]".
"""

def extract_frame(video_path, output_path):
    cmd = [
        "ffmpeg", "-y", "-i", video_path, "-ss", "00:00:01", "-vframes", "1", output_path
    ]
    try:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return os.path.exists(output_path)
    except:
        return False

def analyze_image_with_gemini(client, image_path):
    try:
        with open(image_path, "rb") as f:
            image_bytes = f.read()
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                PROMPT
            ]
        )
        return response.text.strip()
    except Exception as e:
        print(f"Error procesando {image_path}: {e}")
        return "Error"

def process_file(row, client):
    filename = row["Filename"]
    ext = str(row["Extension"]).lower()
    filepath = os.path.join(DIRECTORY, filename)
    
    category = "Desconocido"
    
    if ext in ['.mp4', '.mov']:
        temp_img_path = os.path.join(TEMP_FRAMES_DIR, f"{filename}.jpg")
        if extract_frame(filepath, temp_img_path):
            category = analyze_image_with_gemini(client, temp_img_path)
            try:
                os.remove(temp_img_path)
            except:
                pass
    elif ext in ['.jpg', '.jpeg']:
        category = analyze_image_with_gemini(client, filepath)
    elif ext in ['.heic']:
        temp_img_path = os.path.join(TEMP_FRAMES_DIR, f"{filename}.jpg")
        cmd = ["ffmpeg", "-y", "-i", filepath, temp_img_path]
        try:
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if os.path.exists(temp_img_path):
                category = analyze_image_with_gemini(client, temp_img_path)
                os.remove(temp_img_path)
        except:
            pass
             
    return filename, category

def main():
    if not os.path.exists(INVENTORY_CSV):
        print("El archivo inventory.csv no existe. Ejecuta extract_metadata.py primero.")
        return

    if not os.path.exists(TEMP_FRAMES_DIR):
        os.makedirs(TEMP_FRAMES_DIR)

    print("Inicializando Google GenAI con Vertex AI...")
    try:
        client = genai.Client(
            vertexai=True,
            project=PROJECT_ID,
            location=LOCATION
        )
    except Exception as e:
        print(f"Error inicializando GenAI: {e}")
        return

    df = pd.read_csv(INVENTORY_CSV)
    
    # Filtrar solo los que tienen "Error" o "Desconocido" o NaN para no reprocesar los exitosos
    needs_processing = df[df['Category_AI'].isna() | df['Category_AI'].isin(['Error', 'Desconocido'])]
    already_done = len(df) - len(needs_processing)
    
    if already_done > 0:
        print(f"{already_done} archivos ya clasificados. Procesando {len(needs_processing)} restantes...")
    else:
        print(f"Iniciando análisis de contenido para {len(df)} archivos...")
    
    results = {}
    
    # A toda marcha: 30 workers en paralelo
    with ThreadPoolExecutor(max_workers=30) as executor:
        futures = {executor.submit(process_file, row, client): row for _, row in needs_processing.iterrows()}
        
        count = 0
        for future in as_completed(futures):
            count += 1
            filename, category = future.result()
            results[filename] = category
            
            if count % 10 == 0:
                print(f"Analizados {count}/{len(needs_processing)} archivos...")
                
    # Actualizar CSV solo para los procesados
    for filename, category in results.items():
        df.loc[df['Filename'] == filename, 'Category_AI'] = category
    
    df.to_csv(INVENTORY_CSV, index=False)
    
    # Estadísticas
    print("\n--- RESUMEN ---")
    print(df['Category_AI'].value_counts().to_string())
    print(f"\nAnálisis completado. inventory.csv actualizado.")
    
    # Limpiar carpeta temporal
    try:
        os.rmdir(TEMP_FRAMES_DIR)
    except:
        pass

if __name__ == "__main__":
    main()
