/**
 * Spacely Text and Binary Goods Inc
 *
 * User: lee
 * Date: 8/4/13
 * Time: 2:16 AM
 */
(function (model, async, wu) {
    console.dir(["typeSystem/index.js: model:",model]);

    console.dir(model);
    console.dir(async);
    console.dir(wu);

    var ret = {};
    var createHierarchy = function createHierarchy(typesByName, typeMap) {
        for (var name in  typesByName) {
            var t = typesByName[name];
           // console.log("createHierarchy: " + name);
            ret[name] = getHierarchy(typesByName, typeMap, name);
            console.log("Type: "+name+"->"+JSON.stringify(ret[name]));
        };
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
    var typeNameFromType = function (type) {
        return type.origin.context + "." + type.origin.area + "." + type.name;
    };
    var isType=function(thing){ return !!thing.origin;}
    var isData=function(thing){ return !isType(thing);}
    /**
     * Resolves the type 'name' and uses a scope object as the context for the type.
     *
     * @param typesByName
     * @param name
     * @param scopeObj

     * @returns full type name
     */
    var resolveTypeNameWithScope = function (typesByName, name, scopeObj) {
        var parts = ( name.split('.', 3));

        /// if its already in the full form try to resolve name as is
        if( parts.length >= 3 )
            return typesByName[name] ? name : null;

        //we need to resolve to full type name
        /// try:
        //          scopeObj.origin.context +  scopeObj.origin.area + name
        //      then
        //          'default' + 'common' +  name
        //      then
        //      'default' + 'built-in' +  name

        var tries = [];// list of names to try
        if (isType(scopeObj)){
            tries.push(scopeObj.origin.context +'.'+ scopeObj.origin.area+'.' + name);
        }
        if (isData(scopeObj)){
            tries.push(scopeObj.type.origin.context +'.'+ scopeObj.type.origin.area+'.' + name);
        }
        tries.push("default.common." + name);
        tries.push("default.built-in." + name);

        for ( var x in tries){
           // console.log("Resolving: "+name + " trying "+ tries[x]);
            if ( typesByName[tries[x]]){
                console.log("Resolving: "+name + " matched  "+ tries[x]);
                return tries[x];
            }
        }
        console.log("Could not resolve: "+name);
        return null;
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
            parent = resolveTypeNameWithScope(typesByName,parent, t);
            if (!parent){
                return reportError( "No such type: " + t.parent);
            }
            listSoFar.push(parent);
            return getHierarchy(typesByName, typeMap, parent, listSoFar);
        }
        else
            return reportError( "No such type: " + type);
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


            var categoriesByName = {};
            results[2].forEach(function (vt) {
                var nm = typeNameFromType(vt);
                categoriesByName[nm] = vt;
                allTypesByName[nm] = vt;
                kindMap[nm] = "category";
            });

            var viewTypesByName = {};
            results[3].forEach(function (vt) {
                var nm = typeNameFromType(vt);
                viewTypesByName[nm] = vt;
                allTypesByName[nm] = vt;
                kindMap[nm] = "viewType";
            });

            var typeOf = (function typeOf(typesByName, entity) {
                if (isType(entity))
                    return entity;

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

})(require("../persistence"), require("async"), require("wu").wu);
