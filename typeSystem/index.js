/**
 * Spacely Text and Binary Goods Inc
 *
 * User: lee
 * Date: 8/4/13
 * Time: 2:16 AM
 */
(function (model, async, wu) {
    console.log("typeSystem/index.js");
    console.dir(model);
    console.dir(async);
    console.dir(wu);

    var ret = {};
    var createHierarchy = function createHierarchy(typesByName, typeMap) {
        for (var name in  typesByName) {
            var t = typesByName[name];
            console.log("createHierarchy: " + name);
            ret[name] = getHierarchy(typesByName, typeMap, name);
        }
        ;
        return ret;
    };

    function reportError(msg) {
        throw  new Error(msg);
    };

    var defaultParentForKind = function defaultParentForKind(kind) {
        switch (kind) {

            case "itemType":
                return 'default.built-in.baseIT';

            case "category":
                return 'default.built-in.baseC';

            case "relationshipType":
                return 'default.built-in.baseRT';

            case "viewType":
                return 'default.built-in.baseVT';

            default :
                return reportError("No such kind:" + kind);
        }
    };

    /**
     *
     * @param typesByName
     * @param typeMap
     * @param type
     * @param listSoFar
     * @returns {*}
     */
    var getHierarchy = function getHierarchy(typesByName, typeMap, type, listSoFar) {
        listSoFar = listSoFar || [type];
        var t = typesByName[type];
        if (t) {
            var parent = (t.parent);
            if (!parent) {
                var defaultForType = defaultParentForKind(typeMap[type]);
                if (listSoFar.indexOf(defaultForType) == -1)
                    listSoFar.push(defaultForType);
                return listSoFar;
            }
            listSoFar.push(parent);
            return getHierarchy(typesByName, typeMap, parent, listSoFar);
        }
        else
            return reportError({error: "No such type: " + type});
    };

    async.series([
        function (callback) {
            model.getItemTypes(callback);
            //callback(null, [])
        },
        function (callback) {
            model.getRelationshipTypes(callback);
            //        callback(null, [])
        },
        function (callback) {
            model.getCategories(callback);
            //          callback(null, [])
        },
        function (callback) {
            model.getViewTypes(callback);
            //           callback(null, []);
        }
    ],
// optional callback
        function (err, results) {
            if (err)
                throw err;

            //// Create the byName maps for lookup
            var allTypesByName = {};
            var kindMap = {};
            var itemTypesByName = {};

            var typeNameFromType = function (type) {
                return type.origin[0].context + "." + type.origin[0].area + "." + type.name;
            };

            results[0].forEach(function (it) {
                var nm = typeNameFromType(it);
                itemTypesByName[nm] = it;
                allTypesByName[nm] = it;
                kindMap[nm] = "itemType";
            });

            var relationshipTypesByName = {}
            results[1].forEach(function (it) {
                var nm = typeNameFromType(it);
                relationshipTypesByName[nm] = it;
                allTypesByName[nm] = it;
                kindMap[nm] = "relationshipType";
            });

            var viewTypesByName = {};
            results[2].forEach(function (vt) {
                var nm = typeNameFromType(vt);
                viewTypesByName[nm] = vt;
                allTypesByName[nm] = vt;
                kindMap[nm] = "viewType";
            });

            var typeOf = (function typeOf(typesByName, entity) {
                return typesByName[typeNameFromType(entity.type)];
            }  );

            var deps = createHierarchy(allTypesByName, kindMap);
            var isA = function isA(deps, entity, typeName) {
                var entityTypeName = typeNameFromType(entity.type);
                var hierarchy = getHierarchy(allTypesByName, kindMap, entityTypeName);
                if (!hierarchy)
                    return reportError("No such type: " + entityTypeName);
                return hierarchy.indexOf(typeName) != -1;
            };

            var resolveItem = function (typesByName, kindMap, item) {
                //TODO :
                var itemDef = "default.built-in.BaseIT";
                var tn = item.typeName || itemDef;
                var t = typesByName[tn];

                if (!t) {
                    t = typesByName[itemDef];
                    console.log("No such Type: " + tn + " using " + itemDef)
                }

                if (!t) {
                    throw Error("Internal error: " + itemDef + " not found ");
                }
                item.type = t;
                return item;
            };

            var resolveView = function (typesByName, kindMap, view) {
                //TODO :
                var viewDef = "default.built-in.BaseVT";
                var tn = view.typeName || viewDef;
                var t = typesByName[tn];

                if (!t) {
                    t = typesByName[viewDef];
                    console.log("No such Type: " + tn + " using " + viewDef)
                }

                if (!t) {
                    throw Error("Internal error: " + viewDef + " not found ");
                }
                view.type = t;
                return view;
            };

            var resolveRelationship = function (typesByName, kindMap, rel) {
                var relDef = "default.built-in.BaseRT";
                var tn = rel.typeName || relDef;
                var t = typesByName[tn];

                if (!t) {
                    t = typesByName[relDef];
                    console.log("No such Type: " + tn + " using " + relDef)
                }

                if (!t) {
                    throw Error("Internal error: " + relDef + " not found ");
                }
                rel.type = t;
                return rel;
            };

            var unresolve = function (thing) {
                thing.type = null;
                return thing;
            };

            /**
             * Resolves the type 'name' and uses a scope object as the context for the type.
             *
             * @param typesByName
             * @param name
             * @param scopeObj

             * @returns full type name
             */
            var resolveTypeNameWithScope = function (typesByName, name, scopeObj) {
                var parts = ( scopeObj.split('.', 3));
                    //we need to resolve to full type name
                    /// try:
                    //          scopeObj.origin.context +  scopeObj.origin.area + name
                    //      then
                    //          'default' + 'common' +  name
                    //      then
                    //      'default' + 'built-in' +  name

                if( parts.length >= 3 )
                    return typesByName[name] ? name : null;

                var tries = scopeObj ?  [scopeObj.origin.context + scopeObj.origin.area + name] : [];
                tries.push("default.common" + name);
                tries.push("default.built-in" + name);

                for ( var x in tries){
                    if ( typesByName[tries[x]])
                    return tries[x];
                }
                return null;
            };

            module.exports = {
                typeOf: wu.curry(typeOf, allTypesByName),// (item|relationship|view) -> (ItemType| RelationshipType| ViewType)
                isA: wu.curry(isA, deps),// (entity,type) => boolean
                hierarchy: wu.curry(getHierarchy, allTypesByName, kindMap),
                resolveItem: wu.curry(resolveItem, allTypesByName, kindMap),
                resolveView: wu.curry(resolveView, allTypesByName, kindMap),
                resolveRelationship: wu.curry(resolveRelationship, allTypesByName, kindMap),
                unresolveItem: (unresolve),
                unresolveView: (unresolve),
                unresolveRelationship: (unresolve),
                resolveTypeName: wu.curry(resolveTypeNameWithScope, allTypesByName)
            };
        });
})(require("mongoAdapter"), require("async"), require("wu").wu);
