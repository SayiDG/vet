import os
import json
import subprocess
import pandas as pd
import exifread
from datetime import datetime

DIRECTORY = r"c:\Users\diega\OneDrive\Escritorio\202411_b\vet"
OUTPUT_CSV = "inventory.csv"

# Añadir ruta de ffmpeg al PATH del entorno
import os
ffmpeg_path = r"C:\Users\diega\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-essentials_build\bin"
os.environ["PATH"] += os.pathsep + ffmpeg_path

def get_video_metadata(filepath):
    try:
        cmd = [
            "ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", filepath
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='replace')
        data = json.loads(result.stdout)
        
        duration = float(data.get("format", {}).get("duration", 0))
        video_stream = next((stream for stream in data.get("streams", []) if stream.get("codec_type") == "video"), None)
        width = video_stream.get("width") if video_stream else None
        height = video_stream.get("height") if video_stream else None
        
        # Intentar buscar GPS en tags de formato
        tags = data.get("format", {}).get("tags", {})
        location = tags.get("location") or tags.get("location-eng")
        
        # Fecha de creación desde metadatos
        creation_time = tags.get("creation_time")
        
        return {
            "duration": duration,
            "width": width,
            "height": height,
            "location_raw": location,
            "metadata_creation_time": creation_time
        }
    except Exception as e:
        print(f"Error reading video metadata for {filepath}: {e}")
        return {}

def get_image_metadata(filepath):
    try:
        with open(filepath, 'rb') as f:
            tags = exifread.process_file(f, details=False)
            date_taken = str(tags.get('EXIF DateTimeOriginal', ''))
            
            # Extraer GPS básico si existe
            gps_lat = tags.get('GPS GPSLatitude')
            gps_lon = tags.get('GPS GPSLongitude')
            gps_raw = f"{gps_lat}, {gps_lon}" if gps_lat and gps_lon else None
            
            return {
                "metadata_creation_time": date_taken,
                "location_raw": gps_raw
            }
    except Exception as e:
        print(f"Error reading image metadata for {filepath}: {e}")
        return {}

def main():
    print(f"Buscando archivos en {DIRECTORY}...")
    files = [f for f in os.listdir(DIRECTORY) if os.path.isfile(os.path.join(DIRECTORY, f))]
    print(f"Se encontraron {len(files)} archivos.")
    
    inventory = []
    
    for idx, filename in enumerate(files):
        filepath = os.path.join(DIRECTORY, filename)
        file_stat = os.stat(filepath)
        size_mb = file_stat.st_size / (1024 * 1024)
        ext = os.path.splitext(filename)[1].lower()
        
        # Fecha base del sistema operativo
        creation_time_os = datetime.fromtimestamp(file_stat.st_ctime).strftime('%Y-%m-%d %H:%M:%S')
        
        row = {
            "Filename": filename,
            "Extension": ext,
            "Size_MB": round(size_mb, 2),
            "OS_Creation_Date": creation_time_os,
            "Duration_s": None,
            "Width": None,
            "Height": None,
            "Metadata_Creation_Date": None,
            "Location_Raw": None,
            "Category_AI": None # Lo llenará el script de Vertex AI luego
        }
        
        if ext in ['.mp4', '.mov']:
            meta = get_video_metadata(filepath)
            row["Duration_s"] = meta.get("duration")
            row["Width"] = meta.get("width")
            row["Height"] = meta.get("height")
            row["Metadata_Creation_Date"] = meta.get("metadata_creation_time")
            row["Location_Raw"] = meta.get("location_raw")
        elif ext in ['.jpg', '.jpeg', '.heic']:
            meta = get_image_metadata(filepath)
            row["Metadata_Creation_Date"] = meta.get("metadata_creation_time")
            row["Location_Raw"] = meta.get("location_raw")
        
        inventory.append(row)
        
        if (idx + 1) % 50 == 0:
            print(f"Procesados {idx + 1}/{len(files)}...")

    df = pd.DataFrame(inventory)
    df.to_csv(os.path.join(DIRECTORY, OUTPUT_CSV), index=False)
    print(f"Inventario guardado exitosamente en {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
