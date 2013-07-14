/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 7/1/13
 * Time: 1:03 AM
 */
(function (findit, fs, path, model) {

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
		/// Get a name map to resolve references
		model.nameMaps(function (err, relCatNameMap, relTypeNameMap, itemTypeNameMap, itemCatNameMap) {

				relCategories.forEach(function (rcat) {
					rcat.origin = {
						context: contextName,
						area: areaName
					};

					// save
					model.saveRelationshipCategory(rcat, function (err, saved) {
						// add to the nameMap
						relCatNameMap[ saved.name ] = saved;
						fDetail({context: contextName, area: areaName, type: 'RelationshipCategory', name: saved.name})
					});

				});
				/// Load ItemCategories
				itemCategories.forEach(function (icat) {
					icat.origin = {
						context: contextName,
						area: areaName
					};

					// save
					itemCatNameMap[ icat.name ] = icat;
					model.saveItemCategory(icat, function (err, saved) {
						// add to the nameMap
						itemCatNameMap[ saved.name ] = saved;
						fDetail({context: contextName, area: areaName, type: 'ItemCategory', name: saved.name})
					});

				});

				itemTypes.forEach(function (itype) {
					itype.origin = {
						context: contextName,
						area: areaName
					};

					if(itype.category){
						var c = itemCatNameMap[itype.category];
						if (!c)
							throw new Error("Category: "+ itype.category+ " not found.");
						itype.category = c;
					}

					if(itype.parent){
						var p = itemTypeNameMap[itype.parent];
						if (!p)
							throw new Error("Item Type: "+ itype.parent+ " not found.");
						itype.parent = p;
					}

					// save
					model.saveItemType(itype, function (err, saved) {
						// add to the nameMap
						itemTypeNameMap[ saved.name ] = saved;
						fDetail({context: contextName, area: areaName, type: 'ItemType', name: saved.name})
					});
				});
				relTypes.forEach(function (relType) {
					relType.origin = {
						context: contextName,
						area: areaName
					};

					// save
					model.saveRelationshipType(relType, function (err, saved) {
						// add to the nameMap
						relTypeNameMap[ saved.name ] = saved;
						fDetail({context: contextName, area: areaName, type: 'RelationshipType', name: saved.name})
					});

				});

				relTypes.forEach(function (rtype) {
					rtype.origin = {
						context: contextName,
						area: areaName
					};

					var relTypeObj = new model.RelationshipType(rtype);

					/// resolve the category name if any
					if (relTypeObj.category) {
						relTypeObj.categoy = relTypeNameMap[ relTypeObj.name ];
					}

					// save
					model.saveRelationshipType(relTypeObj, function (err, saved) {
						// add to the nameMap
						relTypeNameMap[relTypeObj.name] = saved;
						fDetail({context: contextName, area: areaName, type: 'RelationshipType', name: saved.name})
					});
				});

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
			exports.loadContextObject(contextName, areaName, data);
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

})(require('findit'), require('fs'), require('path'), require('../model'));


