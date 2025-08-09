#!/bin/bash

echo "🏦 Bank API - Opening Test Report"
echo "=================================="
echo ""
echo "📊 Generating updated report..."
npm run test:report
echo ""
echo "🌐 Opening report in browser..."

# Detect OS and open in appropriate browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open test-results/test-report.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open test-results/test-report.html
else
    # Windows with WSL
    cmd.exe /c start test-results/test-report.html
fi

echo ""
echo "✅ Report opened in browser!"
echo "📍 Location: test-results/test-report.html"