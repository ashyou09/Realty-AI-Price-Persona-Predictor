"""
Feature transformer to convert simple 5-feature input to model's expected format
"""
import pandas as pd
import numpy as np

def create_feature_dataframe(sqft, bedrooms, bathrooms, location_score, age, 
                             status='Ready_to_move', transaction='Resale', 
                             property_type='Apartment', furnishing='Semi-Furnished',
                             parking=1, locality_index=None):
    """
    Transform simple inputs to the format expected by the trained model.
    
    Args:
        sqft: Square footage
        bedrooms: Number of bedrooms (BHK)
        bathrooms: Number of bathrooms
        location_score: Location score (1-10) - will be used to select locality
        age: Property age
        status: 'Ready_to_move' or 'Almost_ready' (default: 'Ready_to_move')
        transaction: 'Resale' or 'New_Property' (default: 'Resale')
        property_type: 'Apartment' or 'Builder_Floor' (default: 'Apartment')
        furnishing: 'Furnished', 'Semi-Furnished', or 'Unfurnished' (default: 'Semi-Furnished')
        parking: Number of parking spaces (default: 1)
        locality_index: Specific locality index (0-364). If None, uses location_score to estimate.
    
    Returns:
        pandas DataFrame with all features in the order expected by the model
    """
    # Create base DataFrame
    df = pd.DataFrame({
        'Area': [sqft],
        'BHK': [bedrooms],
        'Bathroom': [bathrooms],
        'Parking': [parking],
        'Status': [status],
        'Transaction': [transaction],
        'Type': [property_type],
        'Furnishing': [furnishing],
        'Locality': [0]  # Placeholder, will be set based on location_score
    })
    
    # Binary encoding for Status
    df['Status'] = df['Status'].replace({
        'Almost_ready': 0,
        'Ready_to_move': 1
    })
    
    # Binary encoding for Transaction
    df['Transaction'] = df['Transaction'].replace({
        'New_Property': 0,
        'Resale': 1
    })
    
    # Binary encoding for Type
    df['Type'] = df['Type'].replace({
        'Builder_Floor': 0,
        'Apartment': 1
    })
    
    # Determine locality index based on location_score if not provided
    # Map location_score (1-10) to locality index (0-364)
    # Higher location_score -> higher locality index (better areas)
    if locality_index is None:
        # Map location_score to locality index: 1->0, 10->364, linear mapping
        locality_index = int((location_score - 1) / 9 * 364)
        locality_index = max(0, min(364, locality_index))  # Clamp to valid range
    
    # Set locality (will be one-hot encoded)
    df['Locality'] = locality_index
    
    # One-hot encode Furnishing (matching notebook logic)
    # The notebook uses onehot_encode function which creates dummies and drops original
    furnishing_dummies = pd.get_dummies(df['Furnishing'], prefix='Furnishing')
    # Ensure all three categories exist (set to 0 if not present)
    furnishing_cols = ['Furnishing_Furnished', 'Furnishing_Semi-Furnished', 'Furnishing_Unfurnished']
    for col in furnishing_cols:
        if col not in furnishing_dummies.columns:
            furnishing_dummies[col] = 0
    # Reorder to ensure consistent order
    furnishing_dummies = furnishing_dummies[furnishing_cols]
    df = pd.concat([df, furnishing_dummies], axis=1)
    df = df.drop('Furnishing', axis=1)
    
    # One-hot encode Locality (matching notebook logic)
    # The notebook renames locality values to numbers first, then one-hot encodes
    locality_dummies = pd.get_dummies(df['Locality'], prefix='Locality')
    # Create all 365 locality columns (Locality_0 to Locality_364) in order
    # This matches the notebook's approach where localities are renamed to 0-364
    locality_cols = [f'Locality_{i}' for i in range(365)]
    for col in locality_cols:
        if col not in locality_dummies.columns:
            locality_dummies[col] = 0
    # Reorder to ensure numeric order (Locality_0, Locality_1, ..., Locality_364)
    locality_dummies = locality_dummies.reindex(columns=locality_cols, fill_value=0)
    df = pd.concat([df, locality_dummies], axis=1)
    df = df.drop('Locality', axis=1)
    
    # Ensure columns are in the expected order:
    # Area, BHK, Bathroom, Parking, Status, Transaction, Type,
    # Furnishing_Furnished, Furnishing_Semi-Furnished, Furnishing_Unfurnished,
    # Locality_0, Locality_1, ..., Locality_364
    expected_order = (
        ['Area', 'BHK', 'Bathroom', 'Parking', 'Status', 'Transaction', 'Type'] +
        furnishing_cols +
        locality_cols
    )
    
    # Reorder columns to match expected order
    df = df[expected_order]
    
    return df

def get_feature_order_from_model(model):
    """
    Get the feature order expected by the model.
    CatBoost models store feature names if provided during training.
    """
    if hasattr(model, 'feature_names_'):
        return model.feature_names_
    return None

def transform_features_for_model(sqft, bedrooms, bathrooms, location_score, age, model=None):
    """
    Transform simple inputs to match model's expected feature format and order.
    
    Args:
        sqft: Square footage
        bedrooms: Number of bedrooms
        bathrooms: Number of bathrooms  
        location_score: Location score (1-10)
        age: Property age (not directly used, but can influence defaults)
        model: The trained model (optional, used to get feature order)
    
    Returns:
        numpy array with features in the correct order for the model
    """
    # Create feature DataFrame
    df = create_feature_dataframe(sqft, bedrooms, bathrooms, location_score, age)
    
    # Get feature order from model if available
    if model is not None:
        feature_order = get_feature_order_from_model(model)
        if feature_order is not None:
            # Reorder columns to match model's expected order
            # Add any missing columns with zeros
            for col in feature_order:
                if col not in df.columns:
                    df[col] = 0
            df = df[feature_order]
    
    # Convert to numpy array
    features = df.values.astype(float)
    
    return features, df.columns.tolist()

