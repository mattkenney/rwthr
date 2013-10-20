#!/bin/sh
set -e
NOW=$(date --utc +%Y%m%dT%H%M%SZ)
if [ -r cntyzone.txt ]
then
    LAST=$(cat cntyzone.txt)
    mv cntyzone.txt cntyzone.$LAST.txt
fi
NAME=$(wget -O - http://www.weather.gov/geodata/catalog/wsom/html/cntyzone.htm|egrep -o '/data/bp[0-9][0-9][a-z][a-z][0-9][0-9]\.dbx')
wget -O cntyzone.txt http://www.weather.gov/geodata/catalog/wsom/$NAME
echo $NOW > download.txt

