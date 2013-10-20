#!/bin/sh
set -e
NOW=$(date --utc +%Y%m%dT%H%M%SZ)
if [ -r nexrad-stations.txt ]
then
    LAST=$(cat download.txt)
    mv nexrad-stations.txt nexrad-stations.$LAST.txt
fi
wget http://www.ncdc.noaa.gov/homr/file/nexrad-stations.txt
echo $NOW > download.txt

