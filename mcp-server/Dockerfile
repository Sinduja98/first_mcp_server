FROM python:3.11-slim

WORKDIR /demo

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy server code
COPY main.py .

# For STDIO transport, we don't need to expose ports
# The server will communicate via stdin/stdout

# Set the entrypoint to run the server
ENTRYPOINT ["python", "main.py"]