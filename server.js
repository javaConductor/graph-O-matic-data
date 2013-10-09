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
    ;

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

// View Resource
app.get('/views/:id', api.getView);
app.get('/views', api.getViews);
app.put('/views', api.saveView);
app.post('/views/:id', api.updateView);

// View Item Resourc
app.get('/view-items/:id', api.getViewItem);
app.put('/view-items/:viewId/:itemId/:x/:y', api.createViewItem);
app.post('/view-items/:id/position/:x/:y', api.updateViewItemPosition);

// Item Type Resource
app.get('/item-types/:context/:area/:name', api.getItemType);
app.get('/item-types/:id', api.getItemTypeById);
app.get('/item-types', api.getItemTypes);

// Item Resource
app.get('/items/:id', api.getItem);
app.put('/items', api.saveItem);
app.put('/items/load', api.loadItems);

// Launch server

app.listen(4242);
