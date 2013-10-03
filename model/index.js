/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 1:58 PM
 */

(function (persistence) {

	//////  Relationship Category //////
	//////  Relationship Category //////
	this.saveRelationshipCategory = persistence.saveRelationshipCategory;
	this.getRelationshipCategories = persistence.getRelationshipCategories;

	//////  RelationshipType //////
	//////  RelationshipType //////
	this.saveRelationshipType = persistence.saveRelationshipType;
	this.getRelationshipType = persistence.getRelationshipType;
	this.getRelationshipTypes = persistence.getRelationshipTypes;
	this.getRelationshipTypeById = persistence.getRelationshipTypeById;

	//////  Item Category //////
	//////  Item Category //////
	this.saveItemCategory = persistence.saveItemCategory;
	this.getItemCategories = persistence.getItemCategories;
	this.itemCategoryNameMap = function(f){
		getItemCategories(function(err, iCats){
			if (err){ return f(err, null);}
			var m = {};
			iCats.forEach(function(iCat){
				m[iCat.name] = iCat;
			});
			return f(null, m);
		});
	};

	//////  ItemType  //////
	//////  ItemType  //////
	this.saveItemType = persistence.saveItemType;
	this.getItemType = persistence.getItemType;
	this.getItemTypes = persistence.getItemTypes;
	this.updateItemType = persistence.updateItemType;
    this.getItemTypeByName = persistence.getItemTypeByName;
	this.itemTypeNameMap = function(f){
		getItemTypes(function(err, iCats){
			if (err){ return f(err, null);}
			var m = {};
			iCats.forEach(function(iCat){
				m[iCat.name] = iCat;
			});
			return f(null, m);
		});
	};
	this.getItemTypeById = persistence.getItemTypeById;

	//////  Item  //////
	//////  Item  //////
	this.saveItem = persistence.saveItem;
    this.getItem = persistence.getItem;
    this.deleteItem = persistence.deleteItem;

    //////  View Item //////
    //////  View Item //////
    this.getViewItem = 	persistence.getViewItem;
    this.saveViewItem = 	persistence.saveViewItem;
    this.updateViewItemPosition = persistence.updateViewItemPosition;


    //////  View Type //////
    //////  View Type //////
    this.saveViewType = 	persistence.saveViewType;
    this.getViewTypes = 	persistence.getViewTypes;

    //////  View //////
    //////  View //////
    this.getView = 	persistence.getView;
    this.getViews = 	persistence.getViews;
    this.saveView = 	persistence.saveView;
    this.updateView = persistence.updateView;

    //////  Context //////
	//////  Context //////
	this.getContext = 	persistence.getContext;
	this.saveContext = 	persistence.saveContext;

	/////////// EXPORTS ////////////
	/////////// EXPORTS ////////////

	exports.saveRelationshipCategory = this.saveRelationshipCategory;
	exports.getRelationshipCategories = this.getRelationshipCategories;

	exports.saveRelationshipType = this.saveRelationshipType;
	exports.updateRelationshipType = this.updateRelationshipType;
	exports.getRelationshipType = this.getRelationshipType;

	exports.saveItemCategory = this.saveItemCategory;
	exports.getItemCategory = this.getItemCategory;


	exports.saveItemType = this.saveItemType;
    exports.getItemType = this.getItemType;
    exports.getItemTypeByName = this.getItemTypeByName;
    exports.getItemTypes = this.getItemTypes;
	exports.updateItemType = this.updateItemType;
	exports.getItemTypeById = this.getItemTypeById;

    exports.saveItemType = this.saveItemType;

    exports.saveItem = this.saveItem;
    exports.getItem = this.getItem;
    exports.deleteItem = this.deleteItem;

	exports.saveViewItem = this.saveViewItem;
	exports.getViewItem = this.getViewItem;
	exports.updateViewItemPosition = this.updateViewItemPosition;

	exports.saveView = this.saveView;
    exports.getView = this.getView;
    exports.getViews = this.getViews;
    exports.updateView = this.updateView;

	exports.getContext = this.getContext;
	exports.saveContext = this.saveContext;

	//exports.nameMaps = this.nameMaps;
})(require("../persistence"));
