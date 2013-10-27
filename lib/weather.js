var async = require('async')
,   redis = require("redis").createClient()
,   request = require('request')
,   xml2js = require('xml2js')
;

var EXPIRE = 60 * 60;

function cache(fallback, url, callback)
{
    var key = "weather|" + url;
    redis.get(key, function (err, data)
    {
        if (err) return callback(err);
        if (data !== null)
        {
            try
            {
                data = JSON.parse(data);
            }
            catch (e)
            {
                callback(e);
                return;
            }
            callback(null, data);
            return;
        }
        fallback(url, function (err, data)
        {
            if (err) return callback(err);
            var json = JSON.stringify(data);
            redis.setex(key, EXPIRE, json, function (e)
            {
                callback(e, data);
            });
        });
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

function getKeyName(obj)
{
    if (!isObject(obj)) return;
    for (var key in obj)
    {
        if (!obj.hasOwnProperty(key)) continue;
        if ((/-key$/).test(key))
        {
            return key;
        }
    }
}

function isObject(obj)
{
    return (obj !== null && typeof obj === 'object');
}

function normalize(obj, callback)
{
    // if obj is not an object, just return it
    if (!isObject(obj)) return obj;

    // if this object (still) has a "*-key" key, then it should be
    // a map with a single keyed child
    var keyName = getKeyName(obj)
    ,   norm = keyName && obj[keyName]
    ;
    if (typeof norm === 'string')
    {
        delete obj[keyName];
        var result = {};
        result[norm] = normalize(obj);
        return result;
    }

    // if this object has a "0" key, then make it an array
    // unless the "0" child has a "*-key" key, in which case
    // make it a map with the "*-key" values as the keys
    keyName = obj.hasOwnProperty('0') && getKeyName(obj[0]);
    result = (obj.hasOwnProperty('0') && !keyName) ? [] : {};
    for (var key in obj)
    {
        norm = keyName && isObject(obj[key]) && obj[key].hasOwnProperty(keyName) && obj[key][keyName];
        if (typeof norm === 'string')
        {
            delete obj[key][keyName];
        }
        else
        {
            norm = key.replace(/-/g, '_');
        }
        result[norm] = normalize(obj[key]);
        delete obj[key];
    }

    // in callback mode call the callback
    if (callback)
    {
        callback(null, result);
    }
    return result;
}

function forecast(url, callback)
{
    var steps = [];

    steps.push(async.apply(request, url));
    steps.push(checkResponseCode);
    steps.push(new xml2js.Parser({
        explicitRoot: false,
        explicitArray: false
    }).parseString);
    steps.push(function (data, callback)
    {
        callback(null, data && data.data);
    });
    steps.push(normalize)

    async.waterfall(steps, callback);
}

function observation(url, callback)
{
    var steps = [];

    steps.push(async.apply(request, url));
    steps.push(checkResponseCode);
    steps.push(new xml2js.Parser({
        explicitRoot: false,
        explicitArray: false
    }).parseString);

    async.waterfall(steps, callback);
}

/**
 * Perform multiple parallel actions. When they have finished, pass the result
 * of the first successful action to the callback. The actions should be sorted
 * in order of preference.
 */
function parallel(action, arg, callback)
{
    var state = [];
    async.parallel(arg.map(function (elem, n)
    {
        return function (parallelCallback)
        {
            action(elem[0].url, function (err, data)
            {
                state[n] = true;
                if (callback && !err)
                {
                    // if the this action succeeded, and all of the more
                    // preferred actions have finished, then no need to
                    // wait for the others to finish
                    for (var i = 0; i < n; i++)
                    {
                        if (!state[n]) break;
                    }
                    if (i === n)
                    {
                        callback(null, data);
                        callback = null;
                    }
                }
                parallelCallback(null, {
                    error: err,
                    data: data
                });
            });
        };
    }), function (err, parallelResults)
    {
        if (!callback) return;
        for (var i = 0; i < parallelResults.length; i++)
        {
            if (!parallelResults[i].error)
            {
                callback(null, parallelResults[i].data);
                return;
            }
        }
        var message = parallelResults.reduce(function (buffer, elem)
        {
            if (elem.error)
            {
                buffer.push(elem.error.message);
            }
            return buffer;
        }, []).join(', ');
        callback(new Error(message));
    });
}

module.exports = {
    forecast: function (arg, callback)
    {
        parallel(async.apply(cache, forecast), arg, callback);
    },

    observation: function (arg, callback)
    {
        parallel(async.apply(cache, observation), arg, callback);
    }
}
