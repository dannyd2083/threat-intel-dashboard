@echo off
REM ================================================
REM Threat Intelligence Database Setup (Windows)
REM ================================================

echo.
echo ================================================
echo   Threat Intelligence Database Setup
echo ================================================
echo.

REM Check if Docker is running
echo [1/4] Checking Docker...
docker version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✓ Docker is running

REM Check if container exists and remove if stopped
echo.
echo [2/4] Checking for existing container...
docker ps -a --filter "name=postgres-threat-intel" --format "{{.Names}}" | findstr "postgres-threat-intel" >nul
if not errorlevel 1 (
    echo Found existing container, removing...
    docker rm -f postgres-threat-intel >nul 2>&1
)

REM Start PostgreSQL container
echo.
echo [3/4] Starting PostgreSQL container...
docker run --name postgres-threat-intel -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=threat_intelligence -p 5432:5432 -d postgres:15
if errorlevel 1 (
    echo ERROR: Failed to start container!
    pause
    exit /b 1
)
echo ✓ Container started

REM Wait for PostgreSQL to be ready
echo.
echo Waiting for PostgreSQL to initialize (10 seconds)...
timeout /t 10 /nobreak >nul

REM Create database tables
echo.
echo [4/4] Creating database tables...
type database\setup.sql | docker exec -i postgres-threat-intel psql -U postgres -d threat_intelligence
if errorlevel 1 (
    echo ERROR: Failed to create tables!
    pause
    exit /b 1
)
echo ✓ Tables created (empty)

REM Ask about seed data
echo.
echo ================================================
echo   Do you want to add MOCK DATA for testing?
echo ================================================
echo.
echo Mock data includes:
echo   - 3 sample CVEs
echo   - 3 sample phishing domains
echo   - 9 sample Twitter topics
echo.
echo This is OPTIONAL and only useful for:
echo   - Frontend development
echo   - Demos and presentations
echo   - Before n8n workflows are ready
echo.
set /p add_seed="Add mock data? (y/n): "

if /i "%add_seed%"=="y" (
    echo.
    echo Adding mock data...
    type database\seed-data.sql | docker exec -i postgres-threat-intel psql -U postgres -d threat_intelligence
    echo ✓ Mock data added
) else (
    echo.
    echo ✓ Skipping mock data - tables are empty
    echo   Run: Get-Content database\seed-data.sql ^| docker exec -i postgres-threat-intel psql -U postgres -d threat_intelligence
    echo   if you need to add mock data later.
)

REM Verify setup
echo.
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Database Credentials:
echo   Host: localhost
echo   Database: threat_intelligence
echo   User: postgres
echo   Password: 123456
echo   Port: 5432
echo.
echo Verifying tables...
docker exec -it postgres-threat-intel psql -U postgres -d threat_intelligence -c "\dt"

echo.
echo ✓ All done! You can now configure n8n to use this database.
echo.
pause