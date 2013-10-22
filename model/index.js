/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 1:58 PM
 */

(function (typeSystem, persistence, q) {
//    console.dir(["model/index.js: ts=", typeSystem]);

    typeSystem(function (e, ts) {

        var wrapFunctionWithCallback = function (fn, xformInFn, xformOutFn) {
            return function () {
                // replace the last arg with our function that uses the
                var args = Array.prototype.slice.call(arguments);

                if (args.length === 0){
                    // no args
                }else{
                    /// transform the first arg if necessary
                    if ( xformInFn ) {
                        args[0] = xformInFn(args[0]);
                    }
                }

                /// here we create the Promise
                var deferred = q.defer();
                var p = null;
                switch (args.length) {
                    case 0:
                        p=fn();
                        break;
                    case 1:
                        p=fn(args[0]);
                        break;
                    case 2:
                        p=fn(args[0], args[1]);
                        break;
                    case 3:
                        p=fn(args[0], args[1], args[2]);
                        break;
                    case 4:
                        p=fn(args[0], args[1], args[2], args[3]);
                        break;
                    case 5:
                        p=fn(args[0], args[1], args[2], args[3], args[4]);
                        break;
                    case 6:
                        p=fn(args[0], args[1], args[2], args[3], args[4], args[5]);
                        break;
                };
                p.
                    then(function(d){
                        var x = xformOutFn? xformOutFn(d): d;
                        deferred.resolve(x);
                    })
                    .error(function(e){
                        deferred.reject(e);
                    });

                return deferred.promise;
            };
        };

        var defBeforeFn = function(x){
        };
        var defAfterFn = function(x){};

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

        var theModel = {

        //////  RelationshipType //////
        //////  RelationshipType //////
        saveRelationshipType : wrapFunctionWithCallback(persistence.saveRelationshipType, beforeWrite.relationshipType, afterRead.relationshipType),
        getRelationshipType : wrapFunctionWithCallback(persistence.getRelationshipType, identity, afterRead.relationshipType),
        getRelationshipTypes : wrapFunctionWithCallback(persistence.getRelationshipTypes, identity, function (a) {
            return a.map(afterRead.relationshipType);
        }),
        getRelationshipTypeById: wrapFunctionWithCallback(persistence.getRelationshipTypeById, identity, afterRead.relationshipType),

        //////  Category //////
        //////  Category //////
        saveCategory : wrapFunctionWithCallback(persistence.saveCategory, beforeWrite.category, afterRead.category),
        getCategory : wrapFunctionWithCallback(persistence.getCategory, identity, afterRead.category),
        getCategories : wrapFunctionWithCallback(persistence.getCategories, identity, function (a) {
            return a.map(afterRead.category);
        }),

        //////  ItemType  //////
        //////  ItemType  //////
        saveItemType : wrapFunctionWithCallback(persistence.saveItemType, beforeWrite.itemType, afterRead.itemType),
        getItemType : wrapFunctionWithCallback(persistence.getItemType, identity, afterRead.itemType),
        getItemTypes : wrapFunctionWithCallback(persistence.getItemTypes, identity, function (a) {
            return a.map(afterRead.itemType);
        }),
        updateItemType : wrapFunctionWithCallback(persistence.updateItemType, beforeWrite.itemType, afterRead.itemType),
        getItemTypeByName : wrapFunctionWithCallback(persistence.getItemTypeByName, identity, afterRead.itemType),
        getItemTypeById : wrapFunctionWithCallback(persistence.getItemTypeById, identity, afterRead.itemType),

        //////  Item  //////
        //////  Item  //////
        saveItem : wrapFunctionWithCallback(persistence.saveItem, beforeWrite.item, afterRead.item),
        getItem : wrapFunctionWithCallback(persistence.getItem, beforeWrite.item, afterRead.item),
        getItems : wrapFunctionWithCallback(persistence.getItems, identity, function (a) {
            return a.map(afterRead.item);
        }),
        deleteItem : persistence.deleteItem,

        //////  View Item //////
        //////  View Item //////
        getViewItem : wrapFunctionWithCallback(persistence.getViewItem, identity, afterRead.viewItem),
        saveViewItem : wrapFunctionWithCallback(persistence.saveViewItem, beforeWrite.viewItem, afterRead.viewItem),
        updateViewItemPosition : wrapFunctionWithCallback(persistence.getViewItem, identity, afterRead.viewItem),

        //////  View Type //////
        //////  View Type //////
        saveViewType : wrapFunctionWithCallback(persistence.saveViewType, beforeWrite.viewType, afterRead.viewType),
        getViewTypes : wrapFunctionWithCallback(persistence.getViewTypes, identity, function (a) {
            return a.map(afterRead.viewType);
        }),

        //////  View //////
        //////  View //////
        getView : wrapFunctionWithCallback(persistence.getView, identity, afterRead.view),
        getViews : wrapFunctionWithCallback(persistence.getViews, identity, function (a) {
            return a.map(afterRead.view);
        }),
        saveView : wrapFunctionWithCallback(persistence.saveView, beforeWrite.view, afterRead.view),
        updateView : wrapFunctionWithCallback(persistence.getView, beforeWrite.view, afterRead.view),

        //////  Context //////
        //////  Context //////
        getContext : persistence.getContext,
        saveContext : persistence.saveContext
    };
        /////////// EXPORTS ////////////
        /////////// EXPORTS ////////////

        exports  = theModel;
        console.log("model/index.js: END!");
    });
    //exports.nameMaps = this.nameMaps;
})(require("../typeSystem"), require("../persistence"), require("q"));
