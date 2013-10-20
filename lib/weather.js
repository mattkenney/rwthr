var async = require('async')
,   redis = require("redis").createClient()
,   request = require('request')
,   xml2js = require('xml2js')
;

var EXPIRE = 60 * 60;

function cacheResponse(key, callback, err, data)
{
    var json = JSON.stringify(data);
    redis.setex(key, EXPIRE, json, function (e)
    {
        callback(err || e, data);
    });
}

function checkResponseCode(response, body, callback)
{
    if (response.statusCode != 200)
    {
        callback(new Error('upstream service returned ' + response.statusCode));
        return;
    }
    callback(null, body);
}

function fetch(url, callback)
{
    var key = "upward|" + url;
    redis.get(key, function (err, data)
    {
        if (err) return callback(err);
        if (data !== null)
        {
            callback(null, JSON.parse(data));
            return;
        }
        async.waterfall(
            [
                async.apply(request, url),
                checkResponseCode,
                xml2js.parseString
            ],
            async.apply(cacheResponse, key, callback)
        );
    });
}

module.exports = function (arg, callback)
{
    async.parallel(arg.map(function (elem)
    {
        return function (part)
        {
            fetch(elem[0].url, function (err, data)
            {
                if (!err && callback)
                {
                    callback(err, data);
                    callback = null;
                }
                part(null, err);
            });
        };
    }), function (err, parts)
    {
        if (callback)
        {
            var message = parts.reduce(function (buffer, elem)
            {
                buffer.push(elem.message);
                return buffer;
            }, []).join(', ');
            callback(new Error(message));
        }
    });
};

