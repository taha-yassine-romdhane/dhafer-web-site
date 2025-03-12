#!/bin/bash

echo "Testing server health..."
curl -v http://localhost:3000/api/health

echo -e "\n\nTesting login API..."
curl -v -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"taha.romdhane1999@gmail.com","password":"your-password"}'

echo -e "\n\nTesting OPTIONS request (CORS preflight)..."
curl -v -X OPTIONS http://localhost:3000/api/users/login \
  -H "Origin: http://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
