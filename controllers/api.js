var weather = require('../lib/weather')
,   locator = require('../lib/locator')
;

module.exports = function (app)
{
    app.get('/api/county', function (req, res)
    {
        locator.county(req.query, function (err, data)
        {
            if (err) return next(err);
            res.send(data[0][0]);
        });
    });

    app.get('/api/forecast', function (req, res, next)
    {
        locator.forecast(req.query, function (err, data)
        {
            if (err) return next(err);
            weather.forecast(data, function (err, data)
            {
                if (err) return next(err);
                res.send(data);
            });
        });
    });

    app.get('/api/observation', function (req, res, next)
    {
        locator.observation(req.query, 3, function (err, data)
        {
            if (err) return next(err);
            weather.observation(data, function (err, data)
            {
                if (err) return next(err);
                res.send(data);
            });
        });
    });

    app.get('/api/place', function (req, res, next)
    {
        locator.place(req.query, function (err, data)
        {
            if (err) return next(err);
            res.send(data[0][0]);
        });
    });

    app.get('/api/radar', function (req, res, next)
    {
        locator.radar(req.query, function (err, data)
        {
            if (err) return next(err);
            res.redirect(data[0][0].url);
        });
    });
};

