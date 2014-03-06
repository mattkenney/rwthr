module.exports = function (app)
{
    app.use('/data/', function(req, res, next)
    {
        // expire every three hours, fifteen minutes past the hour - 0:15Z, 3:15Z, etc
        var now = Date.now()
        ,   interval = 3*60*60*1000
        ,   offset = 15*60*1000
        ,   expiration = new Date(Math.ceil((now - offset) / interval) * interval + offset)
        ,   maxAge = Math.round((expiration.getTime() - now) / 1000)
        ;
        res.set('Cache-Control', 'public, max-age=' + maxAge);
        next();
    });
};
