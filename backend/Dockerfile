# Use an official Python runtime as a parent image
FROM python:3.13-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV NLTK_DATA=/app/model/nltk_data

# Set the working directory in the container
WORKDIR /app

# Install uv (Python package installer)
RUN pip install uv

# Copy the pyproject.toml file to the working directory
COPY pyproject.toml .

# Install project dependencies, including the [dev] group for uvicorn
# Using --system to install in the global environment
# Using --no-cache to reduce image size
RUN uv pip install --system --no-cache ".[dev]"

# Copy the server application code into the container
COPY server.py .

# Copy the model directory into the container
COPY model ./model

# Expose port 8000 to the outside world
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
