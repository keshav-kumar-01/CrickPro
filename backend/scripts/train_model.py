import os
import sqlite3
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import pickle

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "cricket.db")
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")

def train_predictor():
    print("Loading data from SQLite database...")
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return
        
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM matches", conn)
    conn.close()
    
    # Basic Feature Engineering
    print(f"Initial raw data shape: {df.shape}")
    print(df.head())
    
    # Target Variable
    # 1 if team1 wins, 0 if team2 wins (exclude ties/no results for simple baseline)
    df = df[(df['winner'] == df['team1']) | (df['winner'] == df['team2'])]
    df['target'] = (df['winner'] == df['team1']).astype(int)
    
    # Encode categorical features
    # (Venue, Team1, Team2, Toss Winner, Toss Decision, Match Type)
    encoders = {}
    categorical_cols = ['venue', 'team1', 'team2', 'toss_winner', 'toss_decision', 'city', 'match_type']
    
    print("Encoding categorical features...")
    for col in categorical_cols:
        le = LabelEncoder()
        # Handle unseen labels by filling NaNs with string 'Unknown'
        df[col] = df[col].fillna('Unknown')
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        
    # Features for the model
    # X = ['city', 'venue', 'team1', 'team2', 'toss_winner', 'toss_decision', 'match_type']
    X = df[['city', 'venue', 'team1', 'team2', 'toss_winner', 'toss_decision', 'match_type']]
    y = df['target']
    
    print(f"Features ready. Building ML Model on {len(df)} historical matches...")
    print("Splitting data -> Train (70%), Validation (15%), Test (15%)")
    
    # Split chronologically or randomly. We'll do random for baseline.
    X_train_temp, X_test, y_train_temp, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train_temp, y_train_temp, test_size=0.176, random_state=42) # 0.176 of 85% is ~15%
    
    # Model Training
    print("Training Random Forest Classifier on historical parameters...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Validation
    val_preds = model.predict(X_val)
    val_acc = accuracy_score(y_val, val_preds)
    print(f"Validation Accuracy: {val_acc:.4f}")
    
    # Test
    test_preds = model.predict(X_test)
    test_acc = accuracy_score(y_test, test_preds)
    print(f"Test Set Accuracy: {test_acc:.4f}")
    
    print("\nClassification Report (Test Set):")
    print(classification_report(y_test, test_preds))
    
    # Save Model
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, "rf_baseline_model.pkl")
    encoder_path = os.path.join(MODEL_DIR, "encoders.pkl")
    
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    with open(encoder_path, 'wb') as f:
        pickle.dump(encoders, f)
        
    print(f"Model saved to: {model_path}")
    print(f"Encoders saved to: {encoder_path}")

if __name__ == "__main__":
    train_predictor()
