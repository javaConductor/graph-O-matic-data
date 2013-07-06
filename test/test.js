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
		model.getItemType(itype.id , function(err, theItemType){
			test.ifError(err);
			test.done();
		});
		console.dir(["error>>", err]);
		console.dir(["new ItemType>>", itype]);
	});
//	test.done();
};
