# Stage 1: Build & Export ONNX
FROM python:3.12-slim AS builder

# Install system dependencies needed for standard opencv-python during export
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1 \
    libxcb1 \
    libx11-6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Install CPU-only PyTorch to minimize download size
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install ultralytics
RUN pip install --no-cache-dir ultralytics

COPY yolov8n.pt .

# Export yolov8n.pt to yolov8n.onnx
RUN yolo export model=yolov8n.pt format=onnx

# Stage 2: Runtime
FROM python:3.12-slim

# Install system dependencies for OpenCV (libgl1 replaces deprecated libgl1-mesa-glx)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ONNX model from builder stage
COPY --from=builder /build/yolov8n.onnx /app/yolov8n.onnx
COPY . .

CMD ["python", "main.py"]
