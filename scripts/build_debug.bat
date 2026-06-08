@echo off
setlocal
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0..\android"
echo JAVA_HOME=%JAVA_HOME%
echo Running gradlew...
call gradlew.bat assembleDebug --console=plain --stacktrace
endlocal
