"""
Feature Transformer for Real Estate Price Prediction
Converts simple user inputs to the format expected by the trained model.
"""

import pandas as pd
import numpy as np


def create_feature_dataframe(
    sqft,
    bedrooms,
    bathrooms,
    location_score,
    status='Ready_to_move',
    transaction='Resale',
    property_type='Apartment',
    furnishing='Semi-Furnished',
    parking=1
):
    """
    Transform simple inputs to the format expected by the trained model.
    
    Args:
        sqft: Square footage (Area)
        bedrooms: Number of bedrooms (BHK)
        bathrooms: Number of bathrooms
        location_score: Location score (1-10) - mapped to locality index
        status: 'Ready_to_move' or 'Almost_ready' (default: 'Ready_to_move')
        transaction: 'Resale' or 'New_Property' (default: 'Resale')
        property_type: 'Apartment' or 'Builder_Floor' (default: 'Apartment')
        furnishing: 'Furnished', 'Semi-Furnished', or 'Unfurnished' (default: 'Semi-Furnished')
        parking: Number of parking spaces (default: 1)
    
    Returns:
        pandas DataFrame with all features in the order expected by the model
    """
    
    # Create base DataFrame with numerical features
    df = pd.DataFrame({
        'Area': [float(sqft)],
        'BHK': [int(bedrooms)],
        'Bathroom': [int(bathrooms)],
        'Parking': [int(parking)]
    })
    
    # Binary encoding for Status
    status_encoded = 1 if status == 'Ready_to_move' else 0
    df['Status'] = status_encoded
    
    # Binary encoding for Transaction
    transaction_encoded = 1 if transaction == 'Resale' else 0
    df['Transaction'] = transaction_encoded
    
    # Binary encoding for Type
    type_encoded = 1 if property_type == 'Apartment' else 0
    df['Type'] = type_encoded
    
    # One-hot encode Furnishing
    df['Furnishing_Furnished'] = 1 if furnishing == 'Furnished' else 0
    df['Furnishing_Semi-Furnished'] = 1 if furnishing == 'Semi-Furnished' else 0
    df['Furnishing_Unfurnished'] = 1 if furnishing == 'Unfurnished' else 0
    
    # Map location_score (1-10) to locality index
    # This is a simplified mapping - in production, you might want a more sophisticated approach
    # For now, we'll map to a range of 0-364 based on the location score
    locality_index = int((location_score - 1) / 9 * 364)
    locality_index = max(0, min(364, locality_index))  # Clamp to valid range
    
    # One-hot encode Locality
    # Create all 365 locality columns (Locality_0 to Locality_364)
    for i in range(365):
        df[f'Locality_{i}'] = 1 if i == locality_index else 0
    
    return df


def validate_inputs(sqft, bedrooms, bathrooms, location_score):
    """
    Validate input parameters.
    
    Args:
        sqft: Square footage
        bedrooms: Number of bedrooms
        bathrooms: Number of bathrooms
        location_score: Location score (1-10)
    
    Raises:
        ValueError: If any input is invalid
    """
    if sqft <= 0:
        raise ValueError("Square footage must be greater than 0")
    
    if bedrooms < 0:
        raise ValueError("Number of bedrooms must be non-negative")
    
    if bathrooms < 0:
        raise ValueError("Number of bathrooms must be non-negative")
    
    if not (1 <= location_score <= 10):
        raise ValueError("Location score must be between 1 and 10")


def transform_for_prediction(
    sqft,
    bedrooms,
    bathrooms,
    location_score,
    status='Ready_to_move',
    transaction='Resale',
    property_type='Apartment',
    furnishing='Semi-Furnished',
    parking=1
):
    """
    Transform inputs and return DataFrame ready for model prediction.
    
    Args:
        sqft: Square footage
        bedrooms: Number of bedrooms
        bathrooms: Number of bathrooms
        location_score: Location score (1-10)
        status: Property status (default: 'Ready_to_move')
        transaction: Transaction type (default: 'Resale')
        property_type: Property type (default: 'Apartment')
        furnishing: Furnishing status (default: 'Semi-Furnished')
        parking: Number of parking spaces (default: 1)
    
    Returns:
        pandas DataFrame ready for model prediction
    """
    # Validate inputs
    validate_inputs(sqft, bedrooms, bathrooms, location_score)
    
    # Create feature DataFrame
    df = create_feature_dataframe(
        sqft=sqft,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        location_score=location_score,
        status=status,
        transaction=transaction,
        property_type=property_type,
        furnishing=furnishing,
        parking=parking
    )
    
    return df
