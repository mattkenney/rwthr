#!/bin/sh
set -e
NOW=$(date --utc +%Y%m%dT%H%M%SZ)
if [ -r index.xml ]
then
    LAST=$(cat download.txt)
    mv index.xml index.$LAST.xml
fi
wget http://w1.weather.gov/xml/current_obs/index.xml
echo $NOW > download.txt

