@echo off
REM Batch script to set JAVA_HOME to Android Studio JBR (short path) and build APK
for %%I in ("C:\Program Files\Android\Android Studio\jbr") do set "JBR_SHORT=%%~sI"
if not defined JBR_SHORT (
  echo Could not determine short path for Android Studio JBR. Using original path.
  set "JBR_SHORT=C:\Program Files\Android\Android Studio\jbr"
)
set "JAVA_HOME=%JBR_SHORT%"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo Using JAVA_HOME=%JAVA_HOME%
cd /d %~dp0android
echo Running gradlew assembleDebug ...
echo java path: %JAVA_HOME%\bin\java.exe
if exist "%JAVA_HOME%\bin\java.exe" (
  "%JAVA_HOME%\bin\java.exe" -version
) else (
  echo java.exe not found in %JAVA_HOME%\bin
)
gradlew.bat assembleDebug --console=plain --stacktrace
echo Gradle exit code: %ERRORLEVEL%
exit /b %ERRORLEVEL%