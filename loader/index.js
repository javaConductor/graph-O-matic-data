/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 7/1/13
 * Time: 1:03 AM
 */
(function (findit, fs, api) {

	exports.loadContextObject = function loadContextObject(contextName, areaName, contextObject){

		/// get the categories and types that make of this context or context area
		var relTypes = contextObject.RelationshipTypes;
		var relCategories = contextObject.RelationshipCategories;
		var itemTypes = contextObject.ItemTypes;
		var itemCategories = contextObject.ItemCategories;

		/// Get a name map to resolve references
		var relCatNameMap = api.relationshipCategoryNameMap();
		var relTypeNameMap = api.relationshipTypeNameMap();
		var itemCatNameMap = api.itemCategoryNameMap();
		var itemTypeNameMap = api.itemTypeNameMap();

		relCategories.foreach(function(rcat){
			rcat.origin = {
				context: contextName,
				area: areaName
			};

			// save
			api.saveRelationshipCategory(rcat, function(err, saved){
				// add to the nameMap
				relCatNameMap[ saved.name ] = saved;
			});

		});
		itemCategories.foreach(function(icat){
			icat.origin = {
				context: contextName,
				area: areaName
			};

			// save
			api.saveItemCategory(icat, function(err, saved){
				// add to the nameMap
				itemCatNameMap[ saved.name ] = saved;
			});

		});

		itemTypes.foreach(function(itype){
			itype.origin = {
				context: contextName,
				area: areaName
			};

			// save
			api.saveItemType(itype, function(err, saved){
				// add to the nameMap
				itemTypeNameMap[ saved.name ] = saved;
			});

		});
		relTypes.foreach(function(relType){
			relType.origin = {
				context: contextName,
				area: areaName
			};

			// save
			api.saveRelationshipType(relType, function(err, saved){
				// add to the nameMap
				relTypeNameMap[ saved.name ] = saved;
			});

		});

		itemCategories.foreach(function(icat){
			icat.origin = {
				context: contextName,
				area: areaName
			};

			var catObj = new api.saveItemCategory(icat, function(err, saved){
				// add to the nameMap
				relCatNameMap[catObj.name] = catObj.toObject();
			});
		});

		relTypes.foreach(function(rtype){
			rtype.origin = {
				context: contextName,
				area: areaName
			};

			var relTypeObj = new model.RelationshipType(rtype);

			/// resolve the category name if any
			if (relTypeObj.category){
				relTypeObj.categoy = relCatNameMap[ relTypeObj.id ];
			}

			// save
			relTypeObj.save();

			// add to the nameMap
			relCatNameMap[ relTypeObj.name ] = relTypeObj;

		});


	};

	exports.loadArea = function loadContext(contextName, areaName, file ){
		fs.readFile(file, 'utf8', function (err, data) {
			if (err) {
				console.log('Error: ' + err);
				return;
			}
			data = JSON.parse( data );
			exports.loadContextObject( contextName, areaName, data );
		});
	};

	exports.loadContext = function loadContext(contextName, contextDirectory){
		/// for each *.json.ctxt file in contextDirectory
		var finder = findit.find(contextDirectory);
		finder.on('file', function (file) {
			if ( /(.)*\.json\.ctxt/.test(file.name ) ){
				exports.loadArea( contextName, file.name, file );
			}
		});
	};

	exports.loadContexts = function loadContexts(contextRoot){
		var finder = findit.find(contextRoot);
		//This listens for directories found
		finder.on('directory', function (dir) {
			console.log('Directory: ' + dir + '/');
			exports.loadContext(dir, dir);
		});
	}

})( require('findit'), require('fs') require('models'));


