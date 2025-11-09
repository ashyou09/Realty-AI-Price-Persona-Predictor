# persona_training.py (notebook cell)
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.cluster import KMeans
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score
import joblib

# --- load your property dataset that contains features (example) ---
df = pd.read_csv("your_data.csv")  # replace with your data

# --- choose features ---
num_features = ['price', 'sqft', 'bedrooms', 'bathrooms', 'age', 'amenities_count']
cat_features = ['property_type', 'neighborhood']  # example

X_num = df[num_features]
X_cat = df[cat_features].fillna('missing')

# Preprocessor
numeric_transformer = Pipeline(steps=[
    ('impute', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])
categorical_transformer = Pipeline(steps=[
    ('impute', SimpleImputer(strategy='constant', fill_value='missing')),
    ('onehot', OneHotEncoder(handle_unknown='ignore', sparse=False))
])
preprocessor = ColumnTransformer(transformers=[
    ('num', numeric_transformer, num_features),
    ('cat', categorical_transformer, cat_features)
])

# Fit preprocessor and transform
X_pre = preprocessor.fit_transform(df)

# --- pick k using silhouette / elbow ---
from sklearn.cluster import KMeans
scores = {}
for k in range(2, 8):
    km = KMeans(n_clusters=k, random_state=42)
    labels = km.fit_predict(X_pre)
    scores[k] = silhouette_score(X_pre, labels)
print("Silhouette scores:", scores)
best_k = max(scores, key=scores.get)
print("Choosing k =", best_k)

# Train final KMeans
kmeans = KMeans(n_clusters=best_k, random_state=42)
kmeans.fit(X_pre)

# You may also fit GaussianMixture for probabilities
gm = GaussianMixture(n_components=best_k, random_state=42)
gm.fit(X_pre)

# Save pipeline + model together
persona_pipeline = {
    'preprocessor': preprocessor,
    'model_kmeans': kmeans,
    'model_gm': gm
}
joblib.dump(persona_pipeline, "persona_pipeline_v1.pkl")
print("Saved persona_pipeline_v1.pkl")
