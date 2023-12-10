#!/bin/bash

# Navigate to the Server directory under src from RPS
cd src/Server

# Compile Server.java into the bin directory
javac -d ../../bin Server.java

# Navigate back to the src directory
cd ../..

# Compile Client.java into the bin directory
javac -d bin Client.java

# Output the completion message
echo "Compilation completed"
