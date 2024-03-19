# Use an official Python runtime as the base image
FROM python:3.11-slim

# Set the working directory in the container to /app
WORKDIR /app

# Upgrade pip to the latest version
RUN python -m pip install --upgrade pip

# Install portaudio19-dev
RUN apt-get update && apt-get install -y libasound-dev portaudio19-dev git gcc python3-dev libsndfile1 && rm -rf /var/lib/apt/lists/*

# Copy the current directory contents into the container at /app
COPY . /app

# Install any Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Make port 80 available to the world outside this container
EXPOSE 8080/tcp

# Define environment variable (optional)
ENV NAME World

# Command to run the application
CMD ["python3.11", "routes.py"]
