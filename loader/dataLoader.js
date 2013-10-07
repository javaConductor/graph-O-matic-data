/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 7/1/13
 * Time: 1:03 AM
 */
(function (findit, fs, path, model, async, http, URL) {

	//var suffix = ".ctxt.json";
	var endsWith = function (text, suffix) {
		return text.indexOf(suffix, text.length - suffix.length) !== -1;
	};

	exports.loadDataObject = function loadDataObject( dataObject, f, fDetail) {
		console.log("loader.loadDataObject");

		/// get the items and relationships that make of this dataSet
		var relationships = dataObject.Relationships;
		var items = dataObject.Items;

		var error = function (msg, err) {
			console.log('%s %j', msg, err);
		};

		var typeNames = [];
		var fkResolutionFunctions = [];
		var createResolutionFunction = function createResolutionFunction(itemToUpdate, fieldName, nameMap, nameInMap, fSave) {
			return function (f) {
				if (!nameMap[nameInMap])
					return f("Cannot resolve " + fieldName + ": " + nameInMap);
				if(!itemToUpdate[fieldName])
					itemToUpdate[fieldName] = [];
				itemToUpdate[fieldName].push(nameMap[nameInMap]);
				return fSave(itemToUpdate, f);
			}
		};

		var relTypeNameMap = {}, relCatNameMap = {}, itemTypeNameMap = {}, itemCatNameMap = {};

		async.series([
			/// Items ///
			/// Items ///
			function (callback) {
				async.forEach(items,
				  function (item, cb) {

					  model.saveItem(item, function (err, saved) {
						  if (err) {
							  return cb(err, saved);
						  }
						  cb(err, saved);
					  });
				  },
				  function (err) {
					  callback(err);
				  });
			},
			/// Relationships ///
			/// Relationships ///
			function (callback) {
				async.forEach(relationships,
				  function (relationship, cb) {
					  model.saveRelationship(relationship, function (err, saved) {
						  if (err) {
							  return cb(err, saved);
						  }
						  return cb(err, cat);
					  });
				  },
				  function (err, values) {
					  if (err) {
						  process.exit(-2);
					  }
					  callback(err, values);
				  });
			},

			/// Item FK resolution ///
			/// Item FK resolution ///
			function (callback) {
				async.parallelLimit(fkResolutionFunctions, 1, function (err, data) {
					console.log("ResolutionFunc: "+JSON.stringify(data));
				});
				/// reset this array now that we are done w/ items
				fkResolutionFunctions = [];
				callback(null, []);
			},

			/// the Last Task ///
			/// the Last Task ///
			function (callback) {
				console.log("Data loaded!");
				callback(null);
			}
		]);
	};

	exports.loadDataFile = function loadDataFile( file, f, fDetail) {
		console.log("loader.loadArea");
		fs.readFile(file, 'utf8', function (err, data) {
			if (err) {
				console.log('Error: ' + err);
				return;
			}
			data = JSON.parse(data);
			exports.loadDataObject(data, f, fDetail);
		});
	};

	exports.loadDataFromUrl = function loadDataFromUrl( url, params, f, fDetail) {
		console.log("loader.loadDataFromUrl");
		var u = URL.parse(url);
		var options = {
			hostname: u.host,
			port: u.port,
			path: u.path,
			method: 'GET'
		};

		var req = http.request(options, function(res) {
			console.log('STATUS: ' + res.statusCode);
			console.log('HEADERS: ' + JSON.stringify(res.headers));
			res.setEncoding('utf8');
			res.on('data', function (data) {
				console.log('Data: ' + data);
				data = JSON.parse(data);
				exports.loadDataObject(data, f, fDetail);
			});
		});

		req.on('error', function(e) {
			console.error('Problem loading data: ' + e.message);
		});
		req.end();
	};

})(require('findit'), require('fs'),
	require('path'), require('../model'),
	require('async'), require('http'),
	require('url'));
