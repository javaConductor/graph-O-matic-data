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
  cors = require('cors'),
  api = require('./api');

  mongoose = require('mongoose');

var app =  module.exports = express();

// Config
var corsConfig = {

};
app.configure(function () {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
    app.use(express.logger('dev'));
    app.use(express.static(path.join(application_root, "public")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

});

app.all('*', cors());

app.get('/api', function (req, res) {
	res.send('graph-o-matic-data REST API is running');
});

// View Resource
//app.options('/views/:id', cors());
//app.options('/views', cors());
app.get('/views/:id',  cors(),api.getView);
app.get('/views', cors(), api.getViews);
app.put('/views', cors(), api.saveView);
app.post('/views/:id', cors(),api.updateView);

app.get('/view-types/:id',  cors(), api.getViewType);
app.get('/view-types', cors(), api.getViewTypes);
app.put('/view-types', cors(), api.saveViewType);
app.post('/view-types/:id', cors(),api.updateViewType);

// View Item Resource
app.get('/view-items/:id',  api.getViewItem);
app.put('/view-items/:viewId/:itemId/:x/:y', api.createViewItem);
app.post('/view-items/:id/position/:x/:y', api.updateViewItemPosition);

// Item Type Resource
app.get('/item-types/:context/:area/:name', api.getItemType);
app.get('/item-types/:id', api.getItemType);
app.get('/item-types', api.getItemTypes);

// Item Resource
app.get('/items/:id', api.getItem);
app.get('/items', cors(), api.getItems);
app.put('/items', api.saveItem);
app.put('/items/load', api.loadItems);

// Launch server
app.listen(4242);
