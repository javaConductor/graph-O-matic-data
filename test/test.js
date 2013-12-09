/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 4/23/13
 * Time: 7:04 PM
 */
var should = require("should");
var model = require('../model');
var mongoose = require("mongoose");

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
            console.dir(["Error Saving >>", item, e]);
            test.ifError( e );
        }).done(function(){
            test.done();
        });
};

exports.testItemTypeModel = function(test){
	console.log("---------------------------------------------------------:testItemTypeModel");

	var itemType = {};
        itemType.name = "BasicItemType."+Math.random();
        itemType.title = "Basic Item Type";
        itemType.description = "Test itemType.";
        itemType.properties = [
	];
    itemType.origin = {context:"test", area:"test"};
	itemType.allowExtraProperties = true;
	console.dir(["saving>>", itemType]);
	var itP = model.saveItemType(itemType);
    itP
        .then(function(itype){
            test.ok(itype);
            var outP = model.getItemTypeById( itype.id );
            return outP
                .then( function(itype){
                    test.ok(itype);
                    return itype;
                })
                .catch(function(e){
                    test.ifError(e);
                });
        })
        .catch(function(e){
            test.ifError( e );
        }).done(function(){
            test.done();
        });
};
