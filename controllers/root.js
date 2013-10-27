module.exports = function (app)
{
    app.get('/', function (req, res)
    {
        res.sendfile(app.get('views') + '/root.html');
    });
};
