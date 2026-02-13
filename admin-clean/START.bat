@echo off
color 0A
title MERN Admin Panel - Running

echo.
echo ========================================
echo   MERN Admin Panel
echo ========================================
echo.
echo Starting development server...
echo.
echo Admin Panel will open at:
echo   http://localhost:3000
echo.
echo Backend API:
echo   http://192.168.1.5:5000/api
echo.
echo Login Credentials:
echo   Email: admin@admin.com
echo   Password: admin123
echo.
echo ========================================
echo.

npm run dev
