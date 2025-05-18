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

# Copy application code and model
COPY app.py .
COPY feature_extraction.py .
COPY model.pkl .

# Ensure PATH includes user-installed packages
ENV PATH=/root/.local/bin:$PATH

# Expose port
EXPOSE 5000

# Run the Flask app
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]