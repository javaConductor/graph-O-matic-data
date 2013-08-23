/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 4/23/13
 * Time: 7:04 PM
 */
var should = require("should");
var model = require('../model');
var mongoose = require("mongoose");
/*	var ItemSchema = new Schema({
 type: { type: ObjectId, ref: 'ItemType' },
 title: { type: String, required: false },
 description: { type: String },
 relatedImages: [
 { type: String }
 ],
 relationships: [
 { type: ObjectId, ref: 'Relationship' }
 ], /// ids only
 data: [itemData],
 origin : [originSchema]
 });
 */
exports.testItemModel = function(test){
	console.log("---------------------------------------------------------:testItemModel");

	var item = {};
	item.name = "BasicItem."+Math.random();
	item.title = "Test Item ";
	item.description = "Test item: "+ new Date();
	item.data = [
        {}
    ];
    item.origin = [{context:"test", area:"test"}];
	console.dir(["saving>>", item]);
	model.saveItem(item, function(err, item){
		test.ifError(err );
		test.ok( item );
        console.dir(["Saved OK =>",item, err]);
		test.ok( item.id );
		model.getItemTypeById(item.id , function(err, theItemType){
			test.ifError(err);
			test.ok(theItemType);
			test.done();
		});
	});
//	test.done();
};

