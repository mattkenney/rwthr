var async = require('async')
,   csv = require('csv')
,   iconv = require('iconv-lite')
,   kdt = require('kdt')
,   fs = require('fs')
,   path = require('path')
,   xml2js = require('xml2js')
;

function createKdTree(data, callback)
{
    callback(null, kdt.createKdTree(data, distance, ['lat', 'lon']));
}

function decodeCP1252(data, callback)
{
    callback(null, iconv.decode(data, 'win1252'));
}

function distance(a, b)
{
    return ((a.lat - b.lat)*(a.lat - b.lat) + (a.lon - b.lon)*(a.lon - b.lon));
}

function forecast(where, callback)
{
    var result = normalize(where)
    ,   begin = new Date()
    ,   end = new Date(begin.getTime() + (24*60*60*1000))
    ,   buffer = [];
    // truncate to hour
    begin.setUTCMinutes(0, 0, 0);
    end.setUTCMinutes(0, 0, 0);
    result.begin = begin.toISOString();
    result.end = end.toISOString();
    buffer.push('http://');
    buffer.push('www.weather.gov');
    buffer.push('/forecasts/xml/sample_products/browser_interface/ndfdXMLclient.php');
    buffer.push('?product=time-series&temp=temp&pop12=pop12');
    buffer.push('&end=');
    buffer.push(encodeURIComponent(result.end));
    buffer.push('&lat=');
    buffer.push(result.lat.toFixed(1));
    buffer.push('&lon=');
    buffer.push(result.lon.toFixed(1));
    result.url = buffer.join('');
    callback(null, [[ result ]]);
}

function getNearest(tree, where, count, callback)
{
    var result = tree && tree.nearest(where, count);
    if (!result || !result[0] || !result[0][0])
    {
        var err = new Error('no nearest!');
    }
    callback(err, result);
}

function makeLocator(loader)
{
    var tree;
    return function (where, count, callback)
    {
        where = normalize(where);
        if (!callback)
        {
            callback = count;
            count = 1;
        }
        if (tree)
        {
            getNearest(tree, where, count, callback);
        }
        else
        {
            loader(function (err, data)
            {
                if (err) return callback(err);
                tree = data;
                getNearest(tree, where, count, callback);
            });
        }
    };
}

function makeReadFile(dir, file, encoding)
{
    return function (callback)
    {
        var filename = path.join(__dirname, 'data', dir, file);
        fs.readFile(filename, { encoding: (encoding || null) }, callback);
    };
}

function normalize(where)
{
    return {
        lat: where && Number(where.lat) || 40.7142,
        lon: where && Number(where.lon) || -74.0064
    };
}

function parseFixedWidth(data, callback)
{
    var result = [];
    data = data && data.split && data.split('\r\n');
    var widths = data && data[1] && data[1].split(' ');
    var fields = parseFixedWidthRow(data && data[0], widths);
    for (var i = 2; data && i < data.length; i++)
    {
        var row = parseFixedWidthRow(data[i], widths, fields);
        if (row)
        {
            result.push(row);
        }
    }
    callback(null, result);
}

function parseFixedWidthRow(row, widths, fields)
{
    if (!row || !widths)
    {
        return;
    }
    var result = fields ? {} : []
    ,   offset = 0
    ,   count = 0
    ;
    for (var i = 0; i < widths.length; i++)
    {
        if (widths[i])
        {
            var key = fields ? fields[count] : count;
            result[key] = row.substr(offset, widths[i].length).trim();
            count++;
        }
        offset += (widths[i].length + 1);
    }
    return result;
}

function parseCountyLocations(data, callback)
{
    csv()
        .from(data,
        {
            columns: ['state','zone','cwa','name','state_zone','countyname',
                        'fips','time_zone','fe_area','lat','lon'],
            delimiter: '|',
            trim: true
        })
        .transform(function(row, index)
        {
            if (!row.hasOwnProperty('lon'))
            {
                return null;
            }
            return {
                name: row.name,
                lat: Number(row.lat),
                lon: Number(row.lon),
                cwa: row.cwa
            };
        })
        .to.array(function(data)
        {
            callback(null, data);
        })
        ;
}

function parseObservationLocations(data, callback)
{
    data = data && data.wx_station_index
    data = data && data.station;
    data = data && data.map && data.map(function (station)
    {
        return {
            name: station.station_name[0],
            lat: Number(station.latitude[0]),
            lon: Number(station.longitude[0]),
            url: station.xml_url[0].replace('//weather.gov/', '//w1.weather.gov/')
        };
    });
    callback(null, data);
}

function parsePlaceLocations(data, callback)
{
    csv()
        .from(data,
        {
            columns: ['zcta5', 'ZIPName', 'IntPtLat', 'IntPtLon'],
            trim: true
        })
        .transform(function(row, index)
        {
            return {
                name: row.ZIPName,
                lat: Number(row.IntPtLat),
                lon: Number(row.IntPtLon)
            };
        })
        .to.array(function(data)
        {
            callback(null, data);
        })
        ;
}

function parseRadarLocations(data, callback)
{
    data = data && data.map && data.map(function (station)
    {
        return {
            name: station.NAME,
            lat: Number(station.LAT),
            lon: Number(station.LON),
            url: 'http://radar.weather.gov/ridge/lite/N0R/' + station.ICAO.substring(1) + '_loop.gif'
        };
    });
    callback(null, data);
}

function readCountyLocations(callback)
{
    async.waterfall(
    [
        makeReadFile('WSOM', 'cntyzone.txt'),
        decodeCP1252,
        parseCountyLocations,
        createKdTree
    ], callback);
}

function readObservationLocations(callback)
{
    async.waterfall(
    [
        makeReadFile('NOAA', 'index.xml', 'utf8'),
        xml2js.parseString,
        parseObservationLocations,
        createKdTree
    ], callback);
}

function readPlaceLocations(callback)
{
    async.waterfall(
    [
        makeReadFile('MCDC', 'xtract.csv'),
        decodeCP1252,
        parsePlaceLocations,
        createKdTree
    ], callback);
}

function readRadarLocations(callback)
{
    async.waterfall(
    [
        makeReadFile('HOMR', 'nexrad-stations.txt', 'ascii'),
        parseFixedWidth,
        parseRadarLocations,
        createKdTree
    ], callback);
}

module.exports = {
    county: makeLocator(readCountyLocations),
    forecast: forecast,
    observation: makeLocator(readObservationLocations),
    place: makeLocator(readPlaceLocations),
    radar: makeLocator(readRadarLocations)
};

