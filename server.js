/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:00 AM
 * To change this template use File | Settings | File Templates.
 */
var application_root = __dirname,
  express = require("express"),
  path = require("path"),
  api = require('./api')
  mongoose = require('mongoose');

var app = express();

// Config

app.configure(function () {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(application_root, "public")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});



app.get('/api', function (req, res) {
	res.send('graph-o-matic-data REST API is running');
});

app.get('/api', function (req, res) {
	res.send('graph-o-matic-data REST API is running');
});


// Launch server

app.listen(4242);
