#!/bin/bash
# Test script to verify the backend is working correctly

echo "🔍 Testing Backend Setup..."
echo ""

cd /Users/artz./Desktop/Private/apartment_management/backend

# Start server in background
echo "1. Starting server..."
node server.js > /tmp/server-test.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test if server is running
echo "2. Testing server response..."
RESPONSE=$(curl -s http://localhost:5000/)
if [[ $RESPONSE == *"Apartment Management"* ]]; then
  echo "   ✅ Server is responding correctly"
else
  echo "   ❌ Server not responding as expected"
  cat /tmp/server-test.log
fi

# Test cities endpoint
echo "3. Testing cities API..."
CITIES=$(curl -s http://localhost:5000/api/cities)
if [[ $CITIES == *"Prishtina"* ]]; then
  echo "   ✅ Cities API working - Kosovo cities available"
else
  echo "   ⚠️  Cities API response: $CITIES"
fi

# Clean up
kill $SERVER_PID 2>/dev/null
echo ""
echo "✅ All tests completed!"

