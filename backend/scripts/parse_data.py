import os
import json
import pandas as pd
from sqlalchemy import create_engine
from datetime import datetime

# Build database engine for SQLite
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "cricket.db")
engine = create_engine(f"sqlite:///{DB_PATH}")

RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")

def process_match(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    info = data.get("info", {})
    
    city = info.get("city", "Unknown")
    date = info.get("dates", [""])[0] if info.get("dates") else ""
    match_type = info.get("match_type", "Unknown")
    venue = info.get("venue", "Unknown")
    teams = info.get("teams", ["Unknown", "Unknown"])
    toss_winner = info.get("toss", {}).get("winner", "Unknown")
    toss_decision = info.get("toss", {}).get("decision", "Unknown")
    winner = info.get("outcome", {}).get("winner", "Unknown")
    
    match_id = os.path.basename(file_path).split('.')[0]
    
    return {
        "match_id": match_id,
        "city": city,
        "date": date,
        "match_type": match_type,
        "venue": venue,
        "team1": teams[0] if len(teams) > 0 else "Unknown",
        "team2": teams[1] if len(teams) > 1 else "Unknown",
        "toss_winner": toss_winner,
        "toss_decision": toss_decision,
        "winner": winner
    }

def main():
    print("Starting data parsing to SQLite database...")
    all_formats = ["t20s", "odis", "tests", "ipl", "bbl", "psl", "hundred"]
    
    match_records = []
    
    for fmt in all_formats:
        fmt_dir = os.path.join(RAW_DATA_DIR, fmt)
        if not os.path.exists(fmt_dir):
            print(f"Directory {fmt_dir} does not exist, skipping...")
            continue
            
        files = [f for f in os.listdir(fmt_dir) if f.endswith(".json")]
        print(f"Found {len(files)} files for {fmt.upper()}. Processing...")
        
        for idx, f in enumerate(files):
            try:
                res = process_match(os.path.join(fmt_dir, f))
                match_records.append(res)
            except Exception as e:
                print(f"Error parsing {f}: {e}")
                
            if idx % 500 == 0 and idx > 0:
                print(f"Processed {idx} / {len(files)}")
                
    if match_records:
        print(f"Total matches parsed: {len(match_records)}")
        df = pd.DataFrame(match_records)
        df.to_sql("matches", con=engine, if_exists="replace", index=False)
        print(f"Successfully saved to {DB_PATH}")
    else:
        print("No records parsed.")

if __name__ == "__main__":
    main()
