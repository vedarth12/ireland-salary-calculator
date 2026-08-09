@echo off
REM Deploy script for Irish Salary Calculator
REM Run this after: 1) Getting AdSense IDs, 2) Replacing placeholders in index.html and App.tsx

echo ==========================================
echo Irish Salary Calculator - Deploy Helper
echo ==========================================
echo.

echo Choose deployment platform:
echo 1. Vercel (Recommended - free, auto HTTPS, global CDN)
echo 2. Netlify (Free tier, good features)
echo 3. GitHub Pages (Free, requires GitHub repo)
echo 4. Just build (manual upload)
echo.

set /p choice="Enter choice [1-4]: "

if "%choice%"=="1" (
    echo.
    echo Deploying to Vercel...
    echo Make sure you have Vercel CLI: npm i -g vercel
    echo.
    vercel --prod
    goto :done
)

if "%choice%"=="2" (
    echo.
    echo Deploying to Netlify...
    echo Make sure you have Netlify CLI: npm i -g netlify-cli
    echo.
    netlify deploy --prod --dir=dist
    goto :done
)

if "%choice%"=="3" (
    echo.
    echo Deploying to GitHub Pages...
    echo Make sure you have gh-pages: npm i -g gh-pages
    echo.
    gh-pages -d dist
    goto :done
)

if "%choice%"=="4" (
    echo.
    echo Building only...
    npm run build
    echo.
    echo Build complete! Upload the 'dist' folder to your hosting provider.
    goto :done
)

echo Invalid choice.
:done
echo.
pause