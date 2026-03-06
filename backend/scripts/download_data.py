import os
import requests
import zipfile
import io

DATA_URLS = {
    "T20s": "https://cricsheet.org/downloads/t20s_json.zip",
    "ODIs": "https://cricsheet.org/downloads/odis_json.zip",
    "Tests": "https://cricsheet.org/downloads/tests_json.zip",
    "IPL": "https://cricsheet.org/downloads/ipl_json.zip",
    "BBL": "https://cricsheet.org/downloads/bbl_json.zip",
    "PSL": "https://cricsheet.org/downloads/psl_json.zip",
    "Hundred": "https://cricsheet.org/downloads/hundred_json.zip"
}

RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")

def download_and_extract(name, url):
    print(f"Downloading {name} data from {url}...")
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        # Create directory for the specific format/league
        extract_dir = os.path.join(RAW_DATA_DIR, name.lower())
        os.makedirs(extract_dir, exist_ok=True)
        
        print(f"Extracting {name} to {extract_dir}...")
        with zipfile.ZipFile(io.BytesIO(response.content)) as z:
            z.extractall(extract_dir)
        print(f"Successfully processed {name}! ({len(os.listdir(extract_dir))} files)")
    except Exception as e:
        print(f"Failed to process {name}: {e}")

def main():
    os.makedirs(RAW_DATA_DIR, exist_ok=True)
    print(f"Raw data directory: {RAW_DATA_DIR}")
    for name, url in DATA_URLS.items():
        download_and_extract(name, url)
        
if __name__ == "__main__":
    main()
