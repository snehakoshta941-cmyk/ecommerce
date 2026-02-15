@echo off
color 0A
title MERN Admin Panel - Setup

echo.
echo ========================================
echo   MERN Admin Panel Setup
echo ========================================
echo.
echo Installing dependencies...
echo.

call npm install

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the admin panel, run:
echo   npm run dev
echo.
echo Or use START.bat
echo.
pause
