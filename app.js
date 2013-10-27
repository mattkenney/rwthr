#!/usr/bin/env nodejs

var credentials = require('./credentials'),
    express = require('express'),
    flash = require('connect-flash'),
    swig = require('swig'),
    app = express();

// ***** Initialization *****

app.enable('trust proxy');
app.engine('html', swig.renderFile);

app.set('view cache', false);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// ***** Middleware *****

app.use(express.static('public'));
app.use(express.bodyParser());
app.use(express.cookieParser(credentials.cookie));
app.use(express.cookieSession());
app.use(express.logger());
app.use(express.errorHandler());
app.use(flash());

// flash support -- we need to call req.flash() just before render()
app.use(function(req, res, next)
{
    var render = res.render;
    res.render = function (view, locals, callback)
    {
        if (typeof callback !== 'function' && typeof locals === 'function')
        {
            callback = locals;
            locals = {};
        }
        else if (!locals)
        {
            locals = {};
        }
        locals.alerts = req.flash();
        render.call(res, view, locals, callback);
    };
    next();
});

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

app.listen(3000);

console.log('Listening on port 3000');

