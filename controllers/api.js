var geoip = require('../lib/geoip')
,   locator = require('../lib/locator')
,   weather = require('../lib/weather')
;

module.exports = function (app)
{
    app.use('/api/', function(req, res, next)
    {
        res.set('Cache-Control', 'private, max-age=0');
        next();
    });

    app.use('/api/', geoip);

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

    app.get('/api/graph', function (req, res, next)
    {
        locator.graph(req.query, function (err, data)
        {
            if (err) return next(err);
            weather.graph(data, function (err, data)
            {
                if (err) return next(err);
                res.setHeader("Content-Type", "image/svg+xml");
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

    app.get('/api/range', function (req, res, next)
    {
        locator.forecast(req.query, function (err, data)
        {
            if (err) return next(err);
            weather.range(data, function (err, data)
            {
                if (err) return next(err);
                res.send(data);
            });
        });
    });

    app.get('/api/search', function (req, res, next)
    {
        locator.search(req.query.q, 10, function (err, data)
        {
            if (err) return next(err);
            res.send({ places: data });
        });
    });
};
