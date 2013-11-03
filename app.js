#!/usr/bin/env nodejs

var ejs = require('ejs'),
    express = require('express'),
    app = express();

// ***** Initialization *****

app.enable('trust proxy');
app.engine('.html', ejs.__express);

if (app.get('env') !== 'production')
{
    app.set('view cache', false);
}
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// ***** Middleware *****

if (app.get('env') !== 'production')
{
    app.use(express.static('src'));
}
app.use(express.static('public'));
app.use(express.logger());
app.use(express.errorHandler());

// ***** Controllers *****

require('./controllers/api')(app);
require('./controllers/root')(app);

// ***** Error handling *****

// if we get past all the controllers then we 404
app.use(function (req, res, next)
{
    res.status(404);
    res.render('404',
    {
        status: 404,
        url: req.url,
        user: req.user
    });
});

// pretty error page
app.use(function (err, req, res, next)
{
    res.status(500);
    res.render('500',
    {
        status: err.status || 500,
        error: err.message,
        user: req.user
    });
});

// ***** Server *****

app.listen(app.get('port'));

console.log('Listening on port ' + app.get('port'));
