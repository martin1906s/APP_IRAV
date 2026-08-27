@echo off
REM Local APK build for Windows (avoids Unicode path issues with Android SDK)
if not exist Z:\cmake (
  subst Z: "%LOCALAPPDATA%\Android\Sdk"
)
set ANDROID_HOME=Z:\
set ANDROID_SDK_ROOT=Z:\
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot
set GRADLE_USER_HOME=C:\dev\gradle-home
set NODE_ENV=production
cd /d "%~dp0android"
call gradlew.bat assembleRelease
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
cd /d "%~dp0"
if not exist dist mkdir dist
copy /Y "android\app\build\outputs\apk\release\app-release.apk" "dist\IRAV-1.0.0.apk"
echo.
echo APK listo: %~dp0dist\IRAV-1.0.0.apk
