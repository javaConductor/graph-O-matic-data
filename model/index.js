/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 1:58 PM
 */

(function (typeSystem, persistence) {
    console.dir(["model/index.js: ts=", typeSystem]);

    typeSystem(function (e, ts) {

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
                var args = Array.prototype.slice.call(arguments);
                var lidx = args.length - 1;
                if (xformOutFn)
                    args[lidx] = cbFor(args[lidx]);
                if (lidx != 0 && xformInFn) {
                    args[0] = xformInFn(args[0]);
                }
                switch (args.length) {
                    case 1:
                        fn(args[0]);
                        break;
                    case 2:
                        fn(args[0], args[1]);
                        break;
                    case 3:
                        fn(args[0], args[1], args[2]);
                        break;
                    case 4:
                        fn(args[0], args[1], args[2], args[3]);
                        break;
                    case 5:
                        fn(args[0], args[1], args[2], args[3], args[4]);
                        break;
                    case 6:
                        fn(args[0], args[1], args[2], args[3], args[4], args[5]);
                        break;
                }

            };
        };

        var identity = function (x) {
            return x;
        };
        var beforeWrite = {
            view: ts.unresolveView,
            item: ts.unresolveItem,
            viewItem: identity,
            relationship: ts.unresolveRelationship,

            category: identity,

            itemType: identity,
            relationshipType: identity,
            viewType: identity,

            context: identity,
            "*": identity
        };
        var afterRead = {
            view: ts.resolveView,
            item: ts.resolveItem,
            viewItem: identity,
            relationship: ts.resolveRelationship,

            category: identity,

            itemType: identity,
            relationshipType: identity,
            viewType: identity,

            context: identity,
            "*": identity
        };

        //////  RelationshipType //////
        //////  RelationshipType //////
        this.saveRelationshipType = wrapFunctionWithCallback(persistence.saveRelationshipType, beforeWrite.relationshipType, afterRead.relationshipType);
        this.getRelationshipType = wrapFunctionWithCallback(persistence.getRelationshipType, identity, afterRead.relationshipType);
        this.getRelationshipTypes = wrapFunctionWithCallback(persistence.getRelationshipTypes, identity, function (a) {
            return a.map(afterRead.relationshipType);
        });
        this.getRelationshipTypeById = wrapFunctionWithCallback(persistence.getRelationshipTypeById, identity, afterRead.relationshipType);

        //////  Category //////
        //////  Category //////
        this.saveCategory = wrapFunctionWithCallback(persistence.saveCategory, beforeWrite.category, afterRead.category);
        this.getCategory = wrapFunctionWithCallback(persistence.getCategory, identity, afterRead.category);
        this.getCategories = wrapFunctionWithCallback(persistence.getCategories, identity, function (a) {
            return a.map(afterRead.category);
        })

        //////  ItemType  //////
        //////  ItemType  //////
        this.saveItemType = wrapFunctionWithCallback(persistence.saveItemType, beforeWrite.itemType, afterRead.itemType);
        this.getItemType = wrapFunctionWithCallback(persistence.getItemType, identity, afterRead.itemType);
        this.getItemTypes = wrapFunctionWithCallback(persistence.getItemTypes, identity, function (a) {
            return a.map(afterRead.itemType);
        });
        this.updateItemType = wrapFunctionWithCallback(persistence.updateItemType, beforeWrite.itemType, afterRead.itemType);
        this.getItemTypeByName = wrapFunctionWithCallback(persistence.getItemTypeByName, identity, afterRead.itemType);
        this.getItemTypeById = wrapFunctionWithCallback(persistence.getItemTypeById, identity, afterRead.itemType);

        //////  Item  //////
        //////  Item  //////
        this.saveItem = wrapFunctionWithCallback(persistence.saveItem, beforeWrite.item, afterRead.item);
        this.getItem = wrapFunctionWithCallback(persistence.getItem, beforeWrite.item, afterRead.item);
        this.getItems = wrapFunctionWithCallback(persistence.getItems, identity, function (a) {
            return a.map(afterRead.item);
        });
        this.deleteItem = persistence.deleteItem;

        //////  View Item //////
        //////  View Item //////
        this.getViewItem = wrapFunctionWithCallback(persistence.getViewItem, identity, afterRead.viewItem);
        this.saveViewItem = wrapFunctionWithCallback(persistence.saveViewItem, beforeWrite.viewItem, afterRead.viewItem);
        this.updateViewItemPosition = wrapFunctionWithCallback(persistence.getViewItem, identity, afterRead.viewItem);

        //////  View Type //////
        //////  View Type //////
        this.saveViewType = wrapFunctionWithCallback(persistence.saveViewType, beforeWrite.viewType, afterRead.viewType);
        this.getViewTypes = wrapFunctionWithCallback(persistence.getViewTypes, identity, function (a) {
            return a.map(afterRead.viewType);
        });

        //////  View //////
        //////  View //////
        this.getView = wrapFunctionWithCallback(persistence.getView, identity, afterRead.view);
        this.getViews = wrapFunctionWithCallback(persistence.getViews, identity, function (a) {
            return a.map(afterRead.view);
        });
        this.saveView = wrapFunctionWithCallback(persistence.saveView, beforeWrite.view, afterRead.view);
        this.updateView = wrapFunctionWithCallback(persistence.getView, beforeWrite.view, afterRead.view);

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

        exports.saveViewType = this.saveViewType;
        exports.getViewType = this.getViewType;
        exports.getViewTypes = this.getViewTypes;

        exports.saveItem = this.saveItem;
        exports.getItem = this.getItem;
        exports.getItems = this.getItems;
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
    });
    //exports.nameMaps = this.nameMaps;
})(require("../typeSystem"), require("../persistence"));
