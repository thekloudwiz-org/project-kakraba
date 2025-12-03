#!/bin/bash
set -e

echo "Building Lambda package..."

# Clean previous builds
rm -f lambda.zip
rm -rf dist/node_modules

# Build TypeScript
echo "Compiling TypeScript..."
npm run build

# Install production dependencies
echo "Installing production dependencies..."
npm ci --production --silent

# Copy node_modules to dist
echo "Copying dependencies..."
cp -r node_modules dist/

# Create zip package
echo "Creating lambda.zip..."
cd dist
zip -r ../lambda.zip . -q
cd ..

# Reinstall all dependencies (including dev)
echo "Restoring dev dependencies..."
npm ci --silent

# Check package size
PACKAGE_SIZE=$(du -h lambda.zip | cut -f1)
echo "✓ Lambda package created: lambda.zip ($PACKAGE_SIZE)"

# Verify package contents
echo ""
echo "Package contents:"
unzip -l lambda.zip | head -20
echo "..."
echo ""
echo "Total files: $(unzip -l lambda.zip | tail -1 | awk '{print $2}')"
