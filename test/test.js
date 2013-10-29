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
        .then(function(item){
            test.ok(item);
            var outP = model.getItem( item.id );
            return outP
                .then( function(saved){
                    test.ok(saved);
                    return saved;
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

exports.testSaveGetCategory = function(test){
	console.log("---------------------------------------------------------:testSaveGetCategory");

	var category = {};
	category.name = 'TestItemCategory';
    category.origin = {};
    category.origin.context = "test";
    category.origin.area = "test";

	var catP = model.saveCategory(category);

    catP
        .then(function( saved){
		test.ok(saved);
		var savedP = model.getCategory(saved.id);
            savedP
                .then( function( theItemCat){
                    test.ok(theItemCat);
		        })
                .catch(function(err){
                    test.ifError(err);
                })
                .done(function(){
                    test.done();
                });
	    })
        .catch(function(err){
            test.ifError(err);
        });
};

var x = /*exports.testItemTypeWithCategory*/ function(test){
console.log("---------------------------------------------------------:testItemTypeWithCategory");
	var category = {};
	category.name = 'TestItemCategory';
    category.origin = {};
     category.origin.context = "test";
    category.origin.area = "test";
	model.saveCategory(category, function(err, saved){

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
