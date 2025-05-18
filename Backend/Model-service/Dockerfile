# Builder stage
FROM python:3.11.12-slim AS builder

WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.11.12-slim

WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /root/.local /root/.local

# Copy application code, model, dataset, and retraining script
COPY app.py .
COPY feature_extraction.py .
COPY retrain.py .
COPY model.pkl .
COPY phishing.csv .

# Ensure PATH includes user-installed packages
ENV PATH=/root/.local/bin:$PATH

# Ensure the PV mount points exist
RUN mkdir -p /var/lib/mlService/data /var/lib/mlService/ml-model

# Copy initial files to PV (this will only happen if the PV is empty)
# We use a startup script to handle this dynamically
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 5000

# Use entrypoint to initialize PV and start the app
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]