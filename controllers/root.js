module.exports = function (app)
{
    app.get('/', function (req, res)
    {
        res.render('root',
        {
            production: (app.get('env') == 'production')
        });
    });

    app.get('/tropics', function (req, res)
    {
        res.render('tropics',
        {
            production: (app.get('env') == 'production')
        });
    });
};
