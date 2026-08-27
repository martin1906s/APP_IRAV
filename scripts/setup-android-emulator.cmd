@echo off
setlocal EnableExtensions

REM IRAV - setup Android SDK env + AEHD + start emulator
REM Ejecutar como Administrador para instalar el driver de aceleracion.

set "SDK=%LOCALAPPDATA%\Android\Sdk"
set "JBR=C:\Program Files\Android\Android Studio\jbr"
set "AVD=IRAV_API_35"

echo === Configurando variables de usuario ===
setx ANDROID_HOME "%SDK%" >nul
setx ANDROID_SDK_ROOT "%SDK%" >nul
setx JAVA_HOME "%JBR%" >nul

REM PATH de usuario: platform-tools + emulator + cmdline-tools + jbr
for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USERPATH=%%B"
set "ADD1=%SDK%\platform-tools"
set "ADD2=%SDK%\emulator"
set "ADD3=%SDK%\cmdline-tools\latest\bin"
set "ADD4=%JBR%\bin"
echo %USERPATH% | find /I "%ADD1%" >nul || set "USERPATH=%USERPATH%;%ADD1%"
echo %USERPATH% | find /I "%ADD2%" >nul || set "USERPATH=%USERPATH%;%ADD2%"
echo %USERPATH% | find /I "%ADD3%" >nul || set "USERPATH=%USERPATH%;%ADD3%"
echo %USERPATH% | find /I "%ADD4%" >nul || set "USERPATH=%USERPATH%;%ADD4%"
setx Path "%USERPATH%" >nul

set "ANDROID_HOME=%SDK%"
set "ANDROID_SDK_ROOT=%SDK%"
set "JAVA_HOME=%JBR%"
set "PATH=%ADD1%;%ADD2%;%ADD3%;%ADD4%;%PATH%"

echo ANDROID_HOME=%ANDROID_HOME%
echo.

echo === Instalando Android Emulator Hypervisor Driver (AEHD) ===
if not exist "%SDK%\extras\google\Android_Emulator_Hypervisor_Driver\silent_install.bat" (
  echo ERROR: no esta el instalador AEHD. Ejecuta antes:
  echo   "%SDK%\cmdline-tools\latest\bin\android.exe" sdk install extras/google/Android_Emulator_Hypervisor_Driver
  exit /b 1
)

pushd "%SDK%\extras\google\Android_Emulator_Hypervisor_Driver"
call silent_install.bat
set "AEHD_EXIT=%ERRORLEVEL%"
popd
echo AEHD_EXIT=%AEHD_EXIT%
echo.

echo === Verificando aceleracion ===
"%SDK%\emulator\emulator-check.exe" accel
echo.

echo === Dispositivos adb ===
"%SDK%\platform-tools\adb.exe" version
"%SDK%\platform-tools\adb.exe" devices
echo.

echo === Arrancando emulador %AVD% ===
start "" "%SDK%\emulator\emulator.exe" -avd %AVD% -netdelay none -netspeed full

echo.
echo Listo. Espera a que el emulador arranque y luego en otra terminal:
echo   cd /d "%USERPROFILE%\Documents\TIN\IRAV"
echo   npx expo run:android
echo.
pause
