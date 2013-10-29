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

    var item  = {};
    item.typeName = "baseIT";
    item.title = "Basic test Item ";
    item.name = "Basic Item ";
    item.description = "Test item.";

    console.dir(["saving>>", item]);
    var itP = model.saveItem(item);
    itP
        .then(function(itm){
            test.ok(itm);
            console.dir(["deleting >>", itm]);
            var delP = model.deleteItem( itm.id );
            return delP
                .then( function(resp){
                    test.ok(resp);
                    return resp;
                })
                .catch(function(e){
                    console.dir(["Error deleting item >>", e]);
                    test.ifError(e);
                });
        })
        .catch(function(e){
            console.dir(["Error Saving >>", item]);
            test.ifError( e );
        }).done(function(){
            test.done();
        });
};
