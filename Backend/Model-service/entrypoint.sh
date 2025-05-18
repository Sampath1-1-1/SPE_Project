#!/bin/sh

# Ensure PV directories exist
mkdir -p /var/lib/mlService/data /var/lib/mlService/ml-model

# Copy phishing.csv to PV if it doesn't exist
if [ ! -f /var/lib/mlService/data/phishing.csv ]; then
    cp /app/phishing.csv /var/lib/mlService/data/phishing.csv
fi

# Copy model.pkl to PV if it doesn't exist
if [ ! -f /var/lib/mlService/ml-model/model.pkl ]; then
    cp /app/model.pkl /var/lib/mlService/ml-model/model.pkl
fi

# Execute the CMD
exec "$@"