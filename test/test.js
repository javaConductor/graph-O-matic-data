/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 4/23/13
 * Time: 7:04 PM
 */
var should = require("should");
var model = require('../model');
var mongoose = require("mongoose");
/*
exports.testItemTypeModel = function(test){


	var itemType = {};//new models.ItemType({description:"ddddddd"});
	//itemType.id = mongoose.Types.ObjectId('4edd40c86762e0fb12000F3F');
	itemType.name = "BasicItem";
	itemType.title = "Basic Item ";
	itemType.description = "Test itemType: "+ new Date();
	itemType.properties = [
	];
	itemType.allowExtraProperties = true;
	console.dir(["saving>>", itemType]);
	model.saveItemType(itemType, function(err, itype){
		test.ifError(err);
		test.ok( itype );
		test.ok( itype._id );
		model.getItemType(itype._id , function(err, theItemType){
			test.ifError(err);
			test.ok(theItemType);
			test.done();
		});
		console.dir(["error>>", err]);
		console.dir(["new ItemType>>", itype]);
	});
//	test.done();
};
*/



exports.testSaveGetItemCategory = function(test){
	console.log("---------------------------------------------------------:testSaveGetItemCategory");

	var itemCategory = {};
	itemCategory.name = 'TestItemCategory';
	model.saveItemCategory(itemCategory,function(err, saved){
		test.ifError(err);
		test.ok(saved);
		model.getItemCategory(saved._id, function(err, theItemCat){
				test.ifError(err);
				test.ok(theItemCat);
				test.done();
			});

			console.dir(["error>>", err]);
			console.dir(["new ItemCat>>", saved]);
		});
//	test.done();


};


exports.testItemTypeWithCategory = function(test){
console.log("---------------------------------------------------------:testItemTypeWithCategory");
	var itemCategory = {};
	itemCategory.name = 'TestItemCategory';
	model.saveItemCategory(itemCategory, function(err, saved){

		var itemType = {};//new models.ItemType({description:"ddddddd"});
		//itemType.id = mongoose.Types.ObjectId('4edd40c86762e0fb12000F3F');
		itemType.name = "BasicItem";
		itemType.title = "Basic Item ";
		itemType.description = "Test itemType: "+ new Date();
		itemType.category = saved;
		itemType.properties = [
		];
		itemType.allowExtraProperties = true;
		console.dir(["saving>>", itemType]);
		model.saveItemType(itemType, function(err, itype){
			test.ifError(err);
			test.ok( itype );
			test.ok( itype.category);

				model.getItemType(itype._id, function(err, theItemType){
					test.ifError(err);
					console.dir(["new ItemType>>", theItemType]);

					test.ok(theItemType);
					test.ok(theItemType.category);
					test.ok(theItemType.category._id);
					test.done();
				});

			//console.dir(["error>>", err]);
			//console.dir(["new ItemType>>", itype]);
		});
//	test.done();

	})

};
