# Builder stage
FROM python:3.11.12-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.11.12-slim

WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY app.py .

# Ensure PATH includes user-installed packages
ENV PATH=/root/.local/bin:$PATH

# Expose port
EXPOSE 5001

# Run the Flask app
CMD ["flask", "run", "--host=0.0.0.0", "--port=5001"]