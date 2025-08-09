@echo off
echo 🏦 Bank API - Opening Test Report
echo ==================================
echo.
echo 📊 Generating updated report...
call npm run test:report
echo.
echo 🌐 Opening report in browser...
start "" "test-results\test-report.html"
echo.
echo ✅ Report opened in browser!
echo 📍 Location: test-results\test-report.html
pause