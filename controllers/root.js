module.exports = function (app)
{
    app.get('/', function (req, res)
    {
        res.render('root',
        {
            production: (app.get('env') == 'production')
        });
    });
};
