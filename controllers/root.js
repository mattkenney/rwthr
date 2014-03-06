module.exports = function (app)
{
    app.get('/', function (req, res)
    {
        res.set('Cache-Control', 'public, max-age=86400');
        res.render('root',
        {
            production: (app.get('env') == 'production')
        });
    });

    app.get('/tropics', function (req, res)
    {
        res.set('Cache-Control', 'public, max-age=86400');
        res.render('tropics',
        {
            production: (app.get('env') == 'production')
        });
    });
};
