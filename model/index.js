/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 1:58 PM
 */

(function (persistence, ts) {
    console.log("model/index.js");


    var wrapFunctionWithCallback = function (fn, xformInFn, xformOutFn) {
        var cbFor = function (cb) {
            return function (e, d) {
                if (e)
                    cb(e);
                else
                    cb(null, xformOutFn(d));
            };
        };
        return function () {
            // replace the last arg with our function that uses the
            var lidx = arguments.length - 1;
            arguments[lidx] = cbFor(arguments[lidx]);
            if (lidx != 0) {
                arguments[0] = xformInFn(arguments[0]);
            }
            fn.call(arguments);
        };

    };


    var identity = function (x) {
        return x;
    };
    var beforeWrite = {
        view: ts.resolveView,
        item: ts.resolveItem,
        viewItem: identity,
        relationship: ts.resolveRelationship,

        itemCategory: identity,
        relationshipCategory: identity,

        itemType: identity,
        relationshipType: identity,
        viewType: identity,

        context: identity,
        "*": identity
    };
    var afterRead = {
        view: ts.unresolveView,
        item: ts.resolveItem,
        viewItem: identity,
        relationship: ts.unresolveRelationship,

        itemCategory: identity,
        relationshipCategory: identity,

        itemType: identity,
        relationshipType: identity,
        viewType: identity,

        context: identity,
        "*": identity
    };

    //////  RelationshipType //////
    //////  RelationshipType //////
    this.saveRelationshipType = wrapFunctionWithCallback(persistence.saveRelationshipType, beforeWrite.relationshipType, afterRead.relationshipType);
    this.getRelationshipType = persistence.getRelationshipType;
    this.getRelationshipTypes = persistence.getRelationshipTypes;
    this.getRelationshipTypeById = persistence.getRelationshipTypeById;

    //////  Category //////
    //////  Category //////
    this.saveCategory = persistence.saveCategory;
    this.getCategory = persistence.getCategory;
    this.getCategories = persistence.getCategories;

    //////  ItemType  //////
    //////  ItemType  //////
    this.saveItemType = persistence.saveItemType;
    this.getItemType = persistence.getItemType;
    this.getItemTypes = persistence.getItemTypes;
    this.updateItemType = persistence.updateItemType;
    this.getItemTypeByName = persistence.getItemTypeByName;
    this.getItemTypeById = persistence.getItemTypeById;

    //////  Item  //////
    //////  Item  //////
    this.saveItem = persistence.saveItem;
    this.getItem = persistence.getItem;
    this.deleteItem = persistence.deleteItem;

    //////  View Item //////
    //////  View Item //////
    this.getViewItem = persistence.getViewItem;
    this.saveViewItem = persistence.saveViewItem;
    this.updateViewItemPosition = persistence.updateViewItemPosition;


    //////  View Type //////
    //////  View Type //////
    this.saveViewType = persistence.saveViewType;
    this.getViewTypes = persistence.getViewTypes;

    //////  View //////
    //////  View //////
    this.getView = persistence.getView;
    this.getViews = persistence.getViews;
    this.saveView = persistence.saveView;
    this.updateView = persistence.updateView;

    //////  Context //////
    //////  Context //////
    this.getContext = persistence.getContext;
    this.saveContext = persistence.saveContext;

    /////////// EXPORTS ////////////
    /////////// EXPORTS ////////////

    exports.saveRelationshipType = this.saveRelationshipType;
    exports.updateRelationshipType = this.updateRelationshipType;
    exports.getRelationshipType = this.getRelationshipType;
    exports.getRelationshipTypes = this.getRelationshipTypes;

    exports.saveCategory = this.saveCategory;
    exports.getCategory = this.getCategory;
    exports.getCategories = this.getCategories;

    exports.saveItemType = this.saveItemType;
    exports.getItemType = this.getItemType;
    exports.getItemTypeByName = this.getItemTypeByName;
    exports.getItemTypes = this.getItemTypes;
    exports.updateItemType = this.updateItemType;
    exports.getItemTypeById = this.getItemTypeById;

    exports.saveItemType = this.saveItemType;
    exports.getItemType = this.getItemType;
    exports.getItemTypes = this.getItemTypes;

    exports.saveViewType = this.saveViewType;
    exports.getViewType = this.getViewType;
    exports.getViewTypes = this.getViewTypes;

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
    console.log("model/index.js: END!");

    //exports.nameMaps = this.nameMaps;
})(require("../persistence"), require("../typeSystem"));
