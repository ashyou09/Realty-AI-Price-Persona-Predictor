#!/bin/bash

# Navigate to the script directory
cd "$(dirname "$0")"

# Print start message
echo "🚀 Starting AI Model Server..."
echo "📂 Directory: $(pwd)"

# Check for the specific python interpreter we found working
if [ -f "/opt/anaconda3/bin/python3" ]; then
    PYTHON_CMD="/opt/anaconda3/bin/python3"
else
    # Fallback to system python3
    PYTHON_CMD="python3"
fi

echo "🐍 Using Python: $PYTHON_CMD"

# Run the server
$PYTHON_CMD server.py

#or ./ai-model/run_server.sh
