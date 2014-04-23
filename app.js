var config = require('./config');
var express = require('express');
var engine = require('ejs-locals');
var MongoStore = require('connect-mongostore')(express);
var routes = require('./routes');
var Mongoose = require('mongoose');
var http = require('http');
var path = require('path');
var Memory = require('./models').Memory;


var app = express();

// all environments
app.set('port', config.http.port);
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
// app.set('view options', { layout:'layout.ejs' });
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.cookieParser());
app.use(express.session({	secret: config.http.cookie_secret,
							cookie: {maxAge: 60*60*24*365*10},
						    store: new MongoStore( { db: config.mongodb.database,
						    						host: config.mongodb.host,
						    						port: config.mongodb.port,
						    						username: config.mongodb.user, 
						    						password: config.mongodb.password })}));

app.get('/', routes.index);
app.post('/create', routes.create);
app.get('/list', routes.list);
app.get('/demo', routes.demo);
app.post('/demo', routes.postDemo);
app.get('/terms', routes.terms);
app.get('/:memory/data', routes.viewData);
app.get('/art/:service/:type/:id', routes.art);
app.get('/:memory', routes.view);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
