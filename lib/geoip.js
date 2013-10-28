var geoip = require('geoip-lite')
;

module.exports = function(req, res, next)
{
    if (!req.query || !req.query.lat || !req.query.lon)
    {
        var geo = geoip.lookup(req.ip);
        if (geo)
        {
            req.query = req.query || {};
            req.query.lat = geo.ll[0];
            req.query.lon = geo.ll[1];
        }
    }
    next();
};
