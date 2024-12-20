#!/bin/bash
set -e

echo "🔍 Testing shared module for release..."

# Run all tests
echo "\n📋 Running test suite..."
npm test

# Check for lint issues
echo "\n🧹 Running linter..."
npm run lint

# Verify version consistency
echo "\n📦 Checking version numbers..."
npm run test:version

# Validate all JSON schemas
echo "\n📐 Validating schemas..."
npm run test:schemas

# Check example messages
echo "\n📝 Validating example messages..."
npm run test:examples

echo "\n✅ All checks passed! Ready for release." 