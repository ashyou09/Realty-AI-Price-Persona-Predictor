"""
Real Estate Price Prediction Model Training Script
This script trains a CatBoost regression model for predicting property prices.
It includes detailed data exploration and validation steps to ensure transparency.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from catboost import CatBoostRegressor
import joblib
import sys
from pathlib import Path

# Configuration
DATA_FILE = "delhi.csv"
MODEL_OUTPUT = "realty_price_model.pkl"
TEST_SIZE = 0.2
RANDOM_STATE = 42

def print_header(title):
    """Print a styled header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_section(title):
    """Print a section title."""
    print(f"\n--- {title} ---")

def load_and_explore_data(filepath):
    """Load and perform detailed exploration of the data."""
    print_header("DATA LOADING & EXPLORATION")
    
    if not Path(filepath).exists():
        print(f"❌ Error: Data file '{filepath}' not found!")
        sys.exit(1)
        
    print(f"📂 Loading data from {filepath}...")
    df = pd.read_csv(filepath)
    
    # Basic Info
    print_section("Dataset Overview")
    print(f"✅ Loaded {len(df)} records")
    print(f"📊 Shape: {df.shape}")
    print(f"📝 Columns: {', '.join(df.columns)}")
    
    # Sample Data
    print_section("Sample Data (First 5 Rows)")
    print(df.head().to_string())
    
    # Data Types
    print_section("Data Types")
    print(df.dtypes)
    
    # Missing Values Analysis
    print_section("Missing Values Analysis")
    missing = df.isnull().sum()
    missing = missing[missing > 0]
    if not missing.empty:
        print(missing)
        print("\n⚠️  Handling missing values:")
        
        # Drop critical missing values
        initial_rows = len(df)
        df = df.dropna(subset=['Area', 'BHK', 'Bathroom', 'Price'])
        dropped = initial_rows - len(df)
        if dropped > 0:
            print(f"  - Dropped {dropped} rows with missing critical data (Area, BHK, Bathroom, Price)")
            
        # Fill optional missing values
        fill_strategies = {
            'Parking': 0,
            'Furnishing': 'Unfurnished',
            'Status': 'Ready_to_move',
            'Transaction': 'Resale',
            'Type': 'Apartment'
        }
        
        for col, val in fill_strategies.items():
            if col in df.columns and df[col].isnull().sum() > 0:
                print(f"  - Filling missing '{col}' with '{val}'")
                df[col] = df[col].fillna(val)
    else:
        print("✅ No missing values found.")

    # Feature Statistics
    print_section("Numerical Feature Statistics")
    print(df[['Area', 'BHK', 'Bathroom', 'Price']].describe().to_string())
    
    print_section("Categorical Feature Distribution")
    for col in ['Status', 'Transaction', 'Type', 'Furnishing']:
        if col in df.columns:
            print(f"\n> {col}:")
            print(df[col].value_counts())

    return df

def engineer_features(df):
    """Engineer features for the model."""
    print_header("FEATURE ENGINEERING")
    
    # Binary encoding
    print("🔄 Encoding binary features...")
    
    if 'Status' in df.columns:
        df['Status'] = df['Status'].replace({'Almost_ready': 0, 'Ready_to_move': 1})
        print("  - Status: Almost_ready -> 0, Ready_to_move -> 1")
        
    if 'Transaction' in df.columns:
        df['Transaction'] = df['Transaction'].replace({'New_Property': 0, 'Resale': 1})
        print("  - Transaction: New_Property -> 0, Resale -> 1")
        
    if 'Type' in df.columns:
        df['Type'] = df['Type'].replace({'Builder_Floor': 0, 'Apartment': 1})
        print("  - Type: Builder_Floor -> 0, Apartment -> 1")
    
    # One-hot encoding Furnishing
    print("🔄 One-hot encoding 'Furnishing'...")
    furnishing_dummies = pd.get_dummies(df['Furnishing'], prefix='Furnishing')
    df = pd.concat([df, furnishing_dummies], axis=1)
    df = df.drop('Furnishing', axis=1)
    
    # Ensure all furnishing categories exist
    expected_furnishing = ['Furnishing_Furnished', 'Furnishing_Semi-Furnished', 'Furnishing_Unfurnished']
    for cat in expected_furnishing:
        if cat not in df.columns:
            df[cat] = 0
            print(f"  - Added missing column: {cat}")
    
    # Encode Locality
    print("🔄 Processing 'Locality'...")
    # Create a mapping of locality names to indices
    unique_localities = df['Locality'].unique()
    print(f"  - Found {len(unique_localities)} unique localities")
    
    # Map to indices
    locality_mapping = {loc: idx for idx, loc in enumerate(sorted(unique_localities))}
    df['Locality'] = df['Locality'].map(locality_mapping)
    
    # One-hot encode Locality
    # Note: In a real production system with high cardinality, we might use Target Encoding or Embeddings
    # But for this dataset size, one-hot is acceptable and matches the previous approach
    locality_dummies = pd.get_dummies(df['Locality'], prefix='Locality')
    
    # Ensure we have a consistent number of locality columns (0-364) as per original design
    # This is important for the frontend/inference consistency
    print("  - Creating standard locality columns (0-364)...")
    for i in range(365):
        col_name = f'Locality_{i}'
        if col_name not in locality_dummies.columns:
            locality_dummies[col_name] = 0
            
    # Reorder locality columns to be sure
    locality_cols = [f'Locality_{i}' for i in range(365)]
    locality_dummies = locality_dummies[locality_cols]
    
    df = pd.concat([df, locality_dummies], axis=1)
    df = df.drop('Locality', axis=1)
    
    # Cleanup
    if 'Per_Sqft' in df.columns:
        print("🗑️  Dropping 'Per_Sqft' (derived feature)")
        df = df.drop('Per_Sqft', axis=1)
        
    if 'Address' in df.columns:
         print("🗑️  Dropping 'Address' (unused)")
         df = df.drop('Address', axis=1)
         
    print(f"\n✅ Feature engineering complete. Final Shape: {df.shape}")
    return df

def train_and_evaluate(df):
    """Train and evaluate the model."""
    print_header("MODEL TRAINING & EVALUATION")
    
    # Split data
    X = df.drop('Price', axis=1)
    y = df['Price']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    
    print(f"📊 Split Data: Train={X_train.shape[0]}, Test={X_test.shape[0]}")
    
    # Initialize and train
    print("\n🤖 Training CatBoost Regressor...")
    model = CatBoostRegressor(
        iterations=1000,
        learning_rate=0.1,
        depth=6,
        loss_function='RMSE',
        random_seed=RANDOM_STATE,
        verbose=100,
        early_stopping_rounds=50
    )
    
    model.fit(
        X_train, y_train,
        eval_set=(X_test, y_test),
        use_best_model=True,
        plot=False
    )
    
    # Evaluation
    print_section("Model Performance Evaluation")
    y_pred = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print(f"📉 MAE:  ₹{mae:,.2f}")
    print(f"📉 RMSE: ₹{rmse:,.2f}")
    print(f"📈 R²:   {r2:.4f}")
    
    # Feature Importance
    print_section("Top 10 Important Features")
    feature_importance = model.get_feature_importance()
    feature_names = X.columns
    
    importance_df = pd.DataFrame({
        'Feature': feature_names,
        'Importance': feature_importance
    }).sort_values('Importance', ascending=False)
    
    print(importance_df.head(10).to_string(index=False))
    
    return model

def save_model(model, filepath):
    """Save the trained model."""
    print_header("SAVING MODEL")
    print(f"💾 Saving model to {filepath}...")
    joblib.dump(model, filepath)
    print("✅ Model saved successfully")
    
    # Verification
    print("\n🔍 Verifying saved model...")
    try:
        loaded = joblib.load(filepath)
        print(f"✅ Load successful. Type: {type(loaded).__name__}")
        if hasattr(loaded, 'feature_names_'):
            print(f"✅ Feature names preserved: {len(loaded.feature_names_)} features")
    except Exception as e:
        print(f"❌ Error verifying model: {e}")

def main():
    df = load_and_explore_data(DATA_FILE)
    df = engineer_features(df)
    model = train_and_evaluate(df)
    save_model(model, MODEL_OUTPUT)
    print("\n✨ All tasks completed successfully! ✨\n")

if __name__ == "__main__":
    main()
