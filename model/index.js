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
	this.relationshipCategoryNameMap = function(f){

		getRelationshipCategories(function(err, relCats){
			  if (err){ return f(err, null);}

			  var m = {};
			  relCats.forEach(function(relCat){
				  m[relCat.name] = relCat;
			  });
			  return f(null, m);
		  });
	};

	//////  RelationshipType //////
	//////  RelationshipType //////
	this.saveRelationshipType = persistence.saveRelationshipType;
	this.getRelationshipType = persistence.getRelationshipType;
	this.getRelationshipTypes = persistence.getRelationshipTypes;
	this.relationshipTypeNameMap = function(f){
		getRelationshipTypes(function(err, relTypes){
			  if (err){ return f(err, null);}

			  var m = {};
			  relTypes.forEach(function(relType){
				  m[relType.name] = relType;
			  });
			  return f(null, m);
		  });
	};

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

	//////  Item  //////
	//////  Item  //////
	this.saveItem = persistence.saveItem;
	this.getItem = persistence.getItem;

	//////  View Item //////
	//////  View Item //////
	this.getViewItem = 	persistence.getViewItem;
	this.saveViewItem = 	persistence.saveViewItem;
	this.updateViewItemPosition = persistence.updateViewItemPosition;

	//////  Context //////
	//////  Context //////
	this.getContext = 	persistence.getContext;
	this.saveContext = 	persistence.saveContext;

	///////// Convenience Methods /////////////
	///////// Convenience Methods /////////////
	this.nameMaps = function( f ){
		this.relationshipCategoryNameMap(function (err, relCatNameMap) {
			if(err)
				return f(err);
			this.relationshipTypeNameMap(function (err, relTypeNameMap) {
				if(err)
					return f(err);

				this.itemCategoryNameMap(function (err, itemCatNameMap) {
					if(err)
						return f(err);
					this.itemTypeNameMap(function (err, itemTypeNameMap) {
						if(err)
							return f(err);
						f(null, relTypeNameMap, relCatNameMap, itemTypeNameMap, itemCatNameMap);
					})
				})
			})
		})
	};


	/////////// EXPORTS ////////////
	/////////// EXPORTS ////////////

	exports.saveRelationshipCategory = this.saveRelationshipCategory;
	exports.getRelationshipCategories = this.getRelationshipCategories;
	exports.relationshipCategoryNameMap = this.relationshipCategoryNameMap;

	exports.saveRelationshipType = this.saveRelationshipType;
	exports.updateRelationshipType = this.updateRelationshipType;
	exports.relationshipTypeNameMap = this.relationshipTypeNameMap;

	exports.saveItemCategory = this.saveItemCategory;
	exports.getItemCategory = this.getItemCategory;
	exports.itemCategoryNameMap = this.itemCategoryNameMap;


	exports.saveItemType = this.saveItemType;
	exports.getItemType = this.getItemType;
	exports.updateItemType = this.updateItemType;
	exports.itemTypeNameMap = this.itemTypeNameMap;

	exports.saveItem = this.saveItem;
	exports.getItem = this.getItem;

	exports.saveViewItem = this.saveViewItem;
	exports.getViewItem = this.getViewItem;
	exports.updateViewItemPosition = this.updateViewItemPosition;

	exports.saveView = this.saveView;
	exports.getView = this.getView;

	exports.getContext = this.getContext;
	exports.saveContext = this.saveContext;

	exports.nameMaps = this.nameMaps;
})(require("../persistence"));
