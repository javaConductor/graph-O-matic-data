/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 4/23/13
 * Time: 7:04 PM
 */
var should = require("should");
var model = require('../model');
var mongoose = require("mongoose");

exports.testItemTypeModel = function(test){
	console.log("---------------------------------------------------------:testItemTypeModel");

	var itemType = {};
	itemType.name = "BasicItem."+Math.random();
	itemType.title = "Basic Item ";
	itemType.description = "Test itemType: "+ new Date();
	itemType.properties = [
	];
    itemType.origin = [{context:"test", area:"test"}];
	itemType.allowExtraProperties = true;
	console.dir(["saving>>", itemType]);
	model.saveItemType(itemType, function(err, itype){
		test.ifError(err );
		test.ok( itype );
        console.dir(["Saved OK =>",itype, err]);
		test.ok( itype.id );
		model.getItemTypeById(itype.id , function(err, theItemType){
			test.ifError(err);
			test.ok(theItemType);
			test.done();
		});
	});
//	test.done();
};

exports.testSaveGetItemCategory = function(test){
	console.log("---------------------------------------------------------:testSaveGetItemCategory");

	var itemCategory = {};
	itemCategory.name = 'TestItemCategory';
	model.saveItemCategory(itemCategory,function(err, saved){
		test.ifError(err);
		test.ok(saved);
		model.getItemCategory(saved._id, function(err, theItemCat){
            console.dir(["error>>", err]);
            console.dir(["new ItemCat>>", saved]);
			test.ifError(err);
			test.ok(theItemCat);
			test.done();
		});

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
		itemType.name = "BasicItem."+Math.random();
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

				model.getItemTypeById(itype._id, function(err, theItemType){
					test.ifError(err);
					console.dir(["new ItemType>>", theItemType]);

					test.ok(theItemType);
					test.ok(theItemType.category);
					test.ok(theItemType.category._id);
					test.done();
				});
    	});
	});

};
