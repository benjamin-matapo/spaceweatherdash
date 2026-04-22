FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .
COPY .env* ./

# Expose port (Render uses $PORT env var)
EXPOSE 8000

# Run the application - use $PORT if set by Render, otherwise 8000
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
