#!/usr/bin/env nodejs

var ejs = require('ejs')
,   express = require('express')
,   app = express()
;

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
        url: req.url
    });
});

// pretty error page
app.use(function (err, req, res, next)
{
    console.error(err.stack);
    res.status(500);
    res.render('500',
    {
        status: err.status || 500,
        error: err.message,
        stack: (app.get('env') === 'production') ? '' : err.stack
    });
});

// ***** Server *****

app.listen(app.get('port'));

console.log('Listening on port ' + app.get('port'));
