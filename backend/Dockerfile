# Use an image that supports FreeCAD (Debian/Ubuntu based)
FROM python:3.10-slim

# Install system dependencies and FreeCAD
# FreeCAD is in the Debian repositories (non-free might be needed usually, but often in universe/multiverse)
# We also need xvfb to run FreeCAD headless if it demands a display, though usually console mode is fine.
RUN apt-get update && apt-get install -y \
    freecad \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
# We don't need to install freecad via pip as we use the system one, 
# but we need ensuring python can find it.
# Usually /usr/lib/freecad/lib is where FreeCAD.so lives.
RUN pip install --no-cache-dir -r requirements.txt

# Add FreeCAD to PYTHONPATH
ENV PYTHONPATH="${PYTHONPATH}:/usr/lib/freecad/lib"

# Copy application code
COPY . .

# Create outputs directory
RUN mkdir -p outputs

# Expose port
EXPOSE 8001

# Run the server
CMD ["python", "server.py"]
