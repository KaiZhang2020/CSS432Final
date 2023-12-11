@echo off
REM Change directory to the Server directory under src from RPS
cd src\Server

REM Compile Server.java into the bin directory
javac -d ..\..\bin Server.java 

REM Change back to the RPS directory
cd ..\..\..

REM Compile Client.java into the bin directory
javac -d bin Client.java

REM Output the completion message
echo Compilation completed

REM Pause the output window
pause
