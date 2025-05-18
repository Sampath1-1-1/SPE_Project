import pandas as pd
import os
from sklearn.ensemble import GradientBoostingClassifier
import pickle

# Paths
DATA_PATH = '/var/lib/mlService/data'
MODEL_PATH_DIR = '/var/lib/mlService/ml-model'
FEEDBACK_FILE = os.path.join(DATA_PATH, 'feedback_features.csv')
PHISHING_CSV = os.path.join(DATA_PATH, 'phishing.csv')
NEW_DATASET = os.path.join(DATA_PATH, 'updated_phishing.csv')
MODEL_PATH = os.path.join(MODEL_PATH_DIR, 'model.pkl')

# Ensure directories exist
os.makedirs(DATA_PATH, exist_ok=True)
os.makedirs(MODEL_PATH_DIR, exist_ok=True)

# Load feedback entries
feedback_df = pd.read_csv(FEEDBACK_FILE)

# Load existing dataset
phishing_df = pd.read_csv(PHISHING_CSV)

# Combine datasets
combined_df = pd.concat([phishing_df, feedback_df], ignore_index=True)

# Save the new dataset
combined_df.to_csv(NEW_DATASET, index=False)

# Prepare data for retraining
X = combined_df.drop(["class"], axis=1)
y = combined_df["class"]

# Train the model
gbc = GradientBoostingClassifier(max_depth=4, learning_rate=0.7)
gbc.fit(X, y)

# Save the new model
with open(MODEL_PATH, 'wb') as file:
    pickle.dump(gbc, file)

# Clear the feedback file by overwriting with an empty file
with open(FEEDBACK_FILE, 'w') as f:
    pass