var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var maxNumPages=1;
var interval=10;
if (process.argv.indexOf("--maxNumPages") >= 0) {
    maxNumPages=process.argv[process.argv.indexOf("--maxNumPages")+1];
}
if(process.argv.indexOf('--interval')>=0)
{
    interval=process.argv[process.argv.indexOf("--interval")+1];
}

var PageParser=require('./parsers/PageParser')(maxNumPages);
var NotifyHandler=require('./sockets/NotifyHandler');
var _=require('lodash');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

//--------------------------------------------------------------------
//--------------------------------------------------------------------
//--------------------------------------------------------------------
PageParser.updateAds();
setInterval(function(){
    console.log("================TIMER RUN UPDATE==============");
    PageParser.updateAds();
},interval*1000);

app.get('/GetAllAds', function(req, res) {
    PageParser.updateAds();
    res.json("OK");
})

app.get('/updateAds',function(req,res){
    PageParser.updateAds();
    res.json({status:'handling'});
});

app.get('/ChangeAdsPosition',function(req,res){
    console.log("============ChangeAdsPosition=================");
    var item=_.cloneDeep(PageParser.listAds[req.query.oldIndex]);
    PageParser.listAds.splice(req.query.oldIndex,1);
    PageParser.listAds.splice(req.query.newIndex,0,item);
    NotifyHandler.UpdateAdsPosition(PageParser.listAds);
    res.json({status:'ok',date:new Date()});
})

//--------------------------------------------------------------------
//--------------------------------------------------------------------
//--------------------------------------------------------------------

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
