import os
import json
import sqlite3
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "cricket.db")
RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id TEXT,
            inning INTEGER,
            batting_team TEXT,
            bowling_team TEXT,
            over INTEGER,
            batter TEXT,
            bowler TEXT,
            non_striker TEXT,
            runs_batter INTEGER,
            runs_extras INTEGER,
            runs_total INTEGER,
            player_out TEXT,
            dismissal_kind TEXT
        )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_batter ON deliveries (batter);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_bowler ON deliveries (bowler);')
    conn.commit()
    return conn

def process_file_deliveries(file_path):
    records = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        match_id = os.path.basename(file_path).split('.')[0]
        innings = data.get("innings", [])
        
        for idx, inning in enumerate(innings):
            team = inning.get("team")
            overs = inning.get("overs", [])
            for over in overs:
                over_num = over.get("over")
                deliveries = over.get("deliveries", [])
                
                for delivery in deliveries:
                    batter = delivery.get("batter")
                    bowler = delivery.get("bowler")
                    non_striker = delivery.get("non_striker")
                    
                    runs = delivery.get("runs", {})
                    runs_batter = runs.get("batter", 0)
                    runs_extras = runs.get("extras", 0)
                    runs_total = runs.get("total", 0)
                    
                    wickets = delivery.get("wickets", [])
                    player_out = None
                    dismissal_kind = None
                    
                    if wickets:
                        player_out = wickets[0].get("player_out")
                        dismissal_kind = wickets[0].get("kind")
                        
                    records.append((
                        match_id, idx + 1, team, None, over_num,
                        batter, bowler, non_striker, runs_batter,
                        runs_extras, runs_total, player_out, dismissal_kind
                    ))
    except Exception as e:
        pass
    return records

def main():
    print("Starting Delivery Extraction (Ball by ball)...")
    conn = init_db()
    
    # CLEAR EXISITNG DB SO WE DON'T DOUBLE RECORD
    conn.execute("DELETE FROM deliveries")
    conn.commit()

    all_files = []
    # Collect all json files across all raw directories
    for root, dirs, files in os.walk(RAW_DATA_DIR):
        for f in files:
            if f.endswith(".json"):
                all_files.append(os.path.join(root, f))
                
    print(f"Found {len(all_files)} match files. Parsing in parallel...")
    
    total_records = []
    
    # Process them in parallel
    with ThreadPoolExecutor(max_workers=8) as executor:
        results = executor.map(process_file_deliveries, all_files)
        for r in results:
            if r:
                total_records.extend(r)
                
    if total_records:
        # Batch insert to avoid MemoryError or taking too long in a single commit, sqlite handles large limits safely with executemany but chunking is safer
        batch_size = 50000
        for i in range(0, len(total_records), batch_size):
            batch = total_records[i:i + batch_size]
            conn.executemany('''
                INSERT INTO deliveries 
                (match_id, inning, batting_team, bowling_team, over, batter, bowler, non_striker, runs_batter, runs_extras, runs_total, player_out, dismissal_kind)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', batch)
        conn.commit()
        print(f"Successfully inserted {len(total_records)} balls into database!")
        
if __name__ == "__main__":
    main()
