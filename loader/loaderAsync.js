/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 7/1/13
 * Time: 1:03 AM
 */
(function (findit, fs, path, model, async) {

	var suffix = ".ctxt.json";
	var endsWith = function (text, suffix) {
		return text.indexOf(suffix, text.length - suffix.length) !== -1;
	};

	exports.loadContextObject = function loadContextObject(contextName, areaName, contextObject, f, fDetail) {
		console.log("loader.loadContextObject");

		/// get the categories and types that make of this context or context area
		var relTypes = contextObject.RelationshipTypes;
		var relCategories = contextObject.RelationshipCategories;
		var itemTypes = contextObject.ItemTypes;
		var itemCategories = contextObject.ItemCategories;
		var itemTypesNeedParents = {};

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
		}

		var relTypeNameMap = {}, relCatNameMap = {}, itemTypeNameMap = {}, itemCatNameMap = {};
		/// Get name maps to resolve references
		//	model.nameMaps(function (err, relTypeNameMap, relCatNameMap,itemTypeNameMap, itemCatNameMap) {

		async.series([
			/// Relationship Categories ///
			/// Relationship Categories ///
			function (callback) {
				async.forEach(relCategories,
				  function (relCat, cb) {
					  relCat.origin = [];
					  relCat.origin.push({
						  context: contextName,
						  area: areaName
					  });

					  model.saveRelationshipCategory(relCat, function (err, cat) {
						  if (err) {
							  return cb(err, cat);
						  }
						  relCatNameMap[cat.name] = cat;
						  typeNames.push(cat.name);
						  cb(err, cat);
					  });
				  },
				  function (err) {
					  callback(err);
				  });

			},
			/// Item Categories ///
			/// Item Categories ///
			function (callback) {
				async.forEach(itemCategories,
				  function (itemCat, cb) {
					  itemCat.origin = [];
					  itemCat.origin.push({
						  context: contextName,
						  area: areaName
					  });

					  model.saveItemCategory(itemCat, function (err, cat) {
						  if (err) {
							  return cb(err, cat);
						  }
						  itemCatNameMap[cat.name] = cat;
						  typeNames.push(cat.name);
						  cb(err, cat);
					  });

				  },
				  function (err) {
					  if (err) {
						  process.exit(-2);
					  }
					  callback(err);
				  });
			},
			/// Relationship Type ///
			/// Relationship Type ///
			function (callback) {
				async.forEach(relTypes,
				  function (relType, cb) {
					  relType.origin = [];
					  relType.origin.push({
						  context: contextName,
						  area: areaName
					  });
					  if (relType.category)
						  relType.category = relCatNameMap[relType.name];
					  var tmpParent = relType.parent;
					  var tmpRecip = relType.reciprocalRelationship;
					  relType.parent = null;
					  relType.reciprocalRelationship = null;
					  model.saveRelationshipType(relType, function (err, saved) {
						  if (err) {
							  return cb(err, saved);
						  }
						  relTypeNameMap[saved.name] = saved;
						  fDetail({context: contextName, area: areaName, type: 'RelationshipType', name: saved.name})
						  typeNames.push(saved.name);
						  if (tmpParent) {
							  var fResolve = createResolutionFunction(saved,
								"parent", relTypeNameMap, tmpParent, model.updateRelationshipType);
							  fkResolutionFunctions.push(fResolve);

						  }
						  if(tmpRecip){
							  fResolve = createResolutionFunction(saved,
								"reciprocalRelationship", relTypeNameMap, tmpRecip,
								model.updateRelationshipType);
							  fkResolutionFunctions.push(fResolve);
						  }
						  cb(null, saved);
					  });
				  },
				  function (err) {
					  if (err) {
						  process.exit(-2);
					  }
					  callback(err);
				  });
			},
			function (callback) {
				var allData = [];
				async.parallelLimit(fkResolutionFunctions, 1, function (err, data) {

				console.log("ResolutionFunc: "+data);
				});
				/// reset this array now that we are done w/ relTypes
				fkResolutionFunctions = [];
				callback(null, []);

			},
			/// Item Type ///
			/// Item Type ///
			function (callback) {
				async.forEach(itemTypes,
				  function (itemType, cb) {
					  itemType.origin = [];
					  itemType.origin.push({
						  context: contextName,
						  area: areaName
					  });

					  if (itemType.category){
						  if (! itemCatNameMap[itemType.category] ){
							  console.error("Cannot resolve itemType:"+itemType.category);
						  }
						  itemType.category = itemCatNameMap[itemType.category];
					  }
					  else
					  	itemType.category = null;

					  var tmpParent = itemType.parent;
					  itemType.parent = null;


					  model.saveItemType(itemType, function (err, saved) {
						  if (err) {
							  return cb(err, saved);
						  }
						  itemTypeNameMap[saved.name] = saved;
						  fDetail({context: contextName, area: areaName, type: 'ItemType', name: saved.name})
						  typeNames.push(saved.name);
						  if (tmpParent) {
							  /// at this point we do not have all the parent itemTypes
							  /// Here we create a function that will get the parents when
							  /// the time is right
							  var fResolve = createResolutionFunction(saved,
								"parent", itemTypeNameMap, tmpParent, model.updateItemType);
							  fkResolutionFunctions.push(fResolve);
						  }
						  cb(null, saved);
					  });
				  },
				  function (err) {

					  if (!err) {
						  // try to get the parents for the ones that didn't have any
						  // check unresolved values
					  }
					  if (err) {
						  process.exit(-2);
					  }
					  callback(err);
				  });
			},

			/// Item Type FK resolution ///
			/// Item Type FK resolution ///
			function (callback) {
				async.parallelLimit(fkResolutionFunctions, 1, function (err, data) {
					console.log("ResolutionFunc: "+JSON.stringify(data));
				});
				/// reset this array now that we are done w/ itemTypes
				fkResolutionFunctions = [];
				callback(null, []);
			},

			/// Save the Context ///
			/// Save the Context ///
			function (callback) {
				model.saveContext(contextName, areaName, typeNames, function (err, saved) {
					if (err){
						console.error("Error saving Context:" + contextName + "." + areaName + ": " + JSON.stringify(err));
						callback(err);
					}else{
						console.log("All loaded! ->", JSON.stringify(saved));
						callback(null, saved);
					}
				});

			},

			/// the Last Task ///
			/// the Last Task ///
			function (callback) {
				console.log("Done!");
				callback(null);
			}
		]);


	};

	var checkForContextLoaded = function checkForContextLoaded(contextName, areaName, f) {
		model.getContext(contextName, areaName, function (err, ctxt) {
			var b = (ctxt) ? true : false;
			f(err, b);
		});
	};

	exports.loadArea = function loadArea(contextName, areaName, file, f, fDetail) {
		console.log("loader.loadArea");
		fs.readFile(file, 'utf8', function (err, data) {
			if (err) {
				console.log('Error: ' + err);
				return;
			}
			data = JSON.parse(data);
			checkForContextLoaded(contextName, areaName, function (err, alreadyLoaded) {
				if (!alreadyLoaded)
					exports.loadContextObject(contextName, areaName, data, f, fDetail);
				else
					console.error("Area: " + contextName + "." + areaName + " is already loaded.");
			});
		});
	};

	exports.loadContext = function loadContext(contextName, contextDirectory, f, fDetail) {
		contextName = contextName || path.basename(contextDirectory);
		console.log("loader.loadContext(): " + contextName + "@" + contextDirectory);


		/// for each *.json.ctxt file in contextDirectory
		var finder = findit.find(contextDirectory);

		finder.on('file', function (file) {
			console.log("loader.loadContext: found contextFile:" + (file));
			if (endsWith(file, suffix)) {
//			if ( /(.)*\.ctxt\.json/.test( file.name ) ){
				console.log("loader.loadContext: contextFile: " + file + " matches pattern.");
				var fname = path.basename(file);
				fname = fname.slice(0, fname.length - suffix.length);
				exports.loadArea(contextName, fname, file, f, fDetail);
			}
		});
		console.log("loader.loadContext: RETURNING.");
	};

	exports.loadContexts = function loadContexts(contextRoot, f, fDetail) {
		console.log("loader.loadContexts");
		var finder = findit.find(contextRoot);
		//This listens for directories found
		finder.on('directory', function (dir) {
			console.log('Directory: ' + dir + '/');
			exports.loadContext(path.basename(dir), dir);
		});
	}

})(require('findit'), require('fs'), require('path'), require('../model'), require('async'));
