/**
 * Spacely Text and Binary Goods Inc
 *
 * User: lee
 * Date: 8/4/13
 * Time: 2:16 AM
 */
(function (model, wu, q, logger, utils) {
//    console.dir(["typeSystem/index.js: model=", model]);

    function reportError(msg) {
        throw  new Error(msg);
    };

///
    ////////////////////////////////////////////////////////////////////////////////////////////
    // Hierarchy
    ////////////////////////////////////////////////////////////////////////////////////////////
    /**
     *
     * @param typesByNameP
     * @param kindMapP
     * @returns promise(typeName -> Array(ancestors))
     */
    var createHierarchyP = function createHierarchy(typesByNameP, kindMapP) {
        var d = q.defer();
        return q.all([typesByNameP, kindMapP], function (ap) {
            var typesByName = ap[0];
            var kindMap = ap[1];
            return createHierarchy(typesByName, kindMap);
        });
    };

    /**
     *
     * @param typesByName
     * @param kindMap
     * @returns promise(typeName -> promise(hierarchy))
     */
    var createHierarchy = function createHierarchy(typesByName, kindMap) {
        /// create a list of promises to Hierarchy
        var tna = typesByName.keys();
        //creates object {typename: (Array( ancestor  ) }
        return tna.reduce(function (previousValue, name, index, array) {
            var nu = { };
            nu[name] = getHierarchy(typesByName, kindMap, name);
            return utils.copy(previousValue, nu);
        }, {});
    };

    /**
     *
     * @param typesByNameP - promise(typesByName)
     * @param kindMapP - promise(kindMap)
     * @param typeP - promise(type) | type
     * @param listSoFar - Array( promise(typeName) | typeName)
     *
     * @returns promise (Array( typeName))
     */
    var getHierarchyP = function getHierarchyP(typesByNameP, kindMapP, typeP, listSoFar) {
        var d = q.defer();
        q.when(typesByNameP, function (typesByName) {
            q.when(kindMapP, function (kindMap) {
                q.when(typeP, function (type) {
                    d.resolve(getHierarchy(typesByName, kindMap, type));
                })
            })
        })
            .catch(function (e) {
                d.reject(e);
            });
        return d.promise;
    };

    /**
     *
     * @param typesByName - (typesByName)
     * @param kindMap - (kindMap)
     * @param typeName
     * @param listSoFar - Array( typeName)
     *
     * @returns promise (Array(  typeName))
     */
    var getHierarchy = function getHierarchy(typesByName, kindMap, typeName, listSoFar) {
        var t = resolveTypeNameWithScope(typesByName, typeName);
        listSoFar = listSoFar || [typeName];
        if (t) {
            var parentName = (t.parentName);
            if (!parentName) {
                var defaultForType = defaultTypeForKind(kindMap[typeName]);
                if (listSoFar.indexOf(defaultForType) === -1)
                    listSoFar.push(defaultForType);
                return  (listSoFar);
            }
            var parentType = resolveTypeNameWithScope(typesByName, parentName, t);
            if (!parentType) {
                throw  Error("No such parent type: " + parentName);
            }
            //make sure we have the full name of the type
            parentName = typeNameFromType(parentType);
            listSoFar.push(parentName);
            return getHierarchy(typesByName, kindMap, parentName, listSoFar);
        }
        else {
            return reportError("No such type: " + typeName);
        }
    };

    var defaultParentForKind = function defaultParentForKind(kind) {
        switch (kind) {

            case "item":
                return 'default.built-in.baseIT';

            case "relationship":
                return 'default.built-in.baseRT';

            case "view":
                return 'default.built-in.baseVT';

            default :
                return reportError("No such kind:" + kind);
        }
    };

    var defaultTypeForKind = function defaultTypeForKind(kind) {
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
        if (!type || !type.origin)
            return null;
        return type.origin.context + "." + type.origin.area + "." + type.name;
    };

    var isType = function (thing) {
        return ( thing && !!thing.origin);
    };
    var isData = function (thing) {
        return !isType(thing);
    };

    /**
     * Resolves the type 'name' and uses a scope object as the context for the type.
     *
     * @param typesByName
     * @param name
     * @param scopeObj

     * @returns promise(full type name)
     */
    var resolveTypeNameWithScope = function (typesByName, name, scopeObj) {

        var parts = ( name.split('.', 3));
        /// if its already in the full form try to resolve name as is
        if (parts.length >= 3 && typesByName[name])
            return (typesByName[name] );
        //we need to resolve to full type name
        /// try:
        //          scopeObj.origin.context +  scopeObj.origin.area + name
        //      then
        //          'default' + 'common' +  name
        //      then
        //      'default' + 'built-in' +  name
        var tries = [];// list of names to try
        if (scopeObj && isType(scopeObj)) {
            tries.push(scopeObj.origin.context + '.' + scopeObj.origin.area + '.' + name);
        }
        if (scopeObj && isData(scopeObj)) {
            tries.push(scopeObj.type.origin.context + '.' + scopeObj.type.origin.area + '.' + name);
        }
        tries.push("default.common." + name);
        tries.push("default.built-in." + name);

        var matches = tries.filter(function (t) {
            // console.log("Resolving: "+name + " trying "+ tries[x]);
            return typesByName[t];
        });
        if (matches.length) {
            console.log("Resolving: " + name + " matched  " + matches[0]);
            return (typesByName[matches[0]]);
        }
        else {
            console.log("Could not resolve: " + name);
            throw new Error("Could not resolve: " + name);
        }
    };

    var itemTypesP = model.getItemTypes();
    var relationshipTypesP = model.getRelationshipTypes();
    var categoryP = model.getCategories();
    var viewTypesP = model.getViewTypes();

    //// Create the byName maps for lookup
    var allTypesByName = {};
    var kindMap = {};

    /// load all the types
    var itP = function (itemTypesP) {
        var itemTypesByName = {};
        return itemTypesP.then(function (itemTypes) {
            itemTypes.forEach(function (it) {
                var nm = typeNameFromType(it);
                itemTypesByName[nm] = it;
            });
            return (itemTypesByName)
        });
    }(itemTypesP);

    var rtP = function (relationshipTypesP) {
        var relationshipTypesByName = {};
        return relationshipTypesP.then(function (relationshipTypes) {
            relationshipTypes.forEach(function (it) {
                var nm = typeNameFromType(it);
                relationshipTypesByName[nm] = it;
                allTypesByName[nm] = it;
                kindMap[nm] = "itemType";
            });
            return (relationshipTypesByName);
        });
    }(relationshipTypesP);
    var catP = function (categoriesP) {
        var categoriesByName = {};
        return categoriesP.then(function (categories) {
            categories.forEach(function (it) {
                var nm = typeNameFromType(it);
                categoriesByName[nm] = it;
                allTypesByName[nm] = it;
                kindMap[nm] = "category";
            });
            return (categoriesByName);
        });
    }(categoryP);
    var vtP = function (viewTypesP) {
        //var d = q.defer();
        var viewTypesByName = {};
        return viewTypesP.then(function (viewTypes) {
            viewTypes.forEach(function (it) {
                var nm = typeNameFromType(it);
                viewTypesByName[nm] = it;
                allTypesByName[nm] = it;
                kindMap[nm] = "viewType";
            });
            return (viewTypesByName);
        });
    }(viewTypesP);
//get them with one promise
    var allByNameP = function (itP, rtP, catP, vtP) {
        var allP = q.all([itP, rtP, catP, vtP]);

        return allP.then(function (allMaps) {
            /// loop thru list copying everything retObj
            var retObj = {};
            allMaps.forEach(function (m) {
                for (var nm in m) {
                    retObj[nm] = m[nm];
                }
            });
            return (retObj);
        });

    }(itP, rtP, catP, vtP);

    /**
     *
     * @type { promise(kindMap) }
     */
    var kindMapP = function (itP, rtP, catP, vtP) {
        var d = q.defer();
        var allP = q.all([itP, rtP, catP, vtP]);

        allP.then(function (allMaps) {
            var retObj = {};
            var its = allMaps[0] || [];
            var rts = allMaps[1] || [];
            var cats = allMaps[2] || [];
            var vts = allMaps[3] || [];

            for (var nm in its) {
                retObj[nm] = "itemType";
            }

            for (nm in rts) {
                retObj[nm] = "relationshipType";
            }

            for (nm in cats) {
                retObj[nm] = "category";
            }

            for (nm in vts) {
                retObj[nm] = "viewType";
            }
            d.resolve(retObj);

        })
            .catch(function (e) {
                d.reject(e);
            });
        return d.promise;
    }(itP, rtP, catP, vtP);

    /**
     *
     * @param typesByNameP - promise(typesByName)
     * @param entityP - promise(entity) | entity
     * @returns {promise|Q.promise}
     */
    var typeOf = function typeOf(typesByNameP, entityP) {
        var d = q.defer();
        typesByNameP.then(function (typesByName) {
            q.when(entityP,function (entity) {
                if (isType(entity))
                    d.resolve(entity);
                else
                    d.resolve(typesByName[typeNameFromType(entity.type)]);
            }).catch(function (e) {
                    d.reject(e);
                })
        });
        return d.promise;
    }; // () -> promise(typeObj)
    /**
     *
     *
     * @type {promise(hierarchy}
     * hierarchy -> {
     *              typename: [typename, parentName, grandParentName, ..., baseType For Kind],
     *              typename2: [typename2, ... ]
     *              }
     */
    var hierarchyP = createHierarchyP(allByNameP, kindMapP);//promise( hierarchy)

    var hierarchy = function(typeName){
        return hierarchyP.then(function(h){
            return h[typeName];
        })
    };

    /**
     *
     * @param hierarchyP - promise( hierarchy) | heirarchy
     * @param entityP - promise(entity) | entity
     * @param typeName - name of type with which to check compatibility
     * @returns {*}
     */
    var isA = function isA(hierarchyP, entityP, typeName) {
        var d = q.defer();
        q.when(hierarchyP, function (hierarchy) {
            q.when(entityP, function (entity) {
                var entityTypeName = typeNameFromType(entity.type);
                var hierarchyP = getHierarchy(allTypesByName, kindMap, entityTypeName);
                hierarchyP
                    .then(function (hierarchy) {
                        if (!hierarchy)
                            d.reject("No such type: " + entityTypeName);
                        else
                            d.resolve(!!(hierarchy.indexOf(typeName) != -1));
                    });
            });
        });
        return d.promise;
    };

    var effectiveItemProperties = function (itemTypeName, typesByName) {
        var hP = hierarchy(itemTypeName);
        return hP.then(function(h){
            var eff = {};
            if (!h) return null;
            h.reverse().forEach(function (tn) {
                var t = typesByName[tn];
                if (!t) {
                    throw Error("Internal Error: type '" + tn + "' in hierarchy but not in typesByName!?");
                }
                eff = utils.extend(eff, t.properties);
            });
            return eff;
        });
    };

    /**
     *
     * @param typesByNameP - promise(typeByName)
     * @param kindMapP - promise(kindMap)
     * @param itemP  item || promise(item)
     * @returns { promise(item) }
     */
    var resolveItem = function (typesByNameP, kindMapP, itemP) {
        var d = q.defer();
        return typesByNameP.then(function (typesByName) {
            kindMapP.then(function (kindMap) {
                hierarchyP.then(function (hierarchy) {
                    q.when(itemP, function (item) {
                        var itemDef = "default.built-in.baseIT";
                        var tn = item.typeName || itemDef;

                        resolveTypeNameWithScope(typesByName, tn, undefined)
                            .then(function (t) {
                                console.log("TypeSystem: Resolved to type: " + tn);
                                //TODO: Here we must collapse the properties from all the parents
                                item.type = t;
                                return effectiveItemProperties(tn, typesByName)
                                    .then( function( effProps ){
                                        item.effectiveProperties = effProps;
                                        return item;
                                    })
                            })
                            .catch(function (e) {
                                console.error("TypeSystem: Error resolving Type: " + tn + " using " + itemDef, e);
                                item.type = typesByName[itemDef];
                                return item;
                            })
                    });//when
                });//then
            });//then
        });//then
    };

    /**
     *
     * @param typesByNameP - promise(typeByName)
     * @param kindMapP - promise(kindMap)
     * @param viewP  -  { view | promise(view)
     * @returns promise(view}
     */
    var resolveView = function (typesByNameP, kindMapP, viewP) {
        var d = q.defer();
        typesByNameP.then(function (typesByName) {
            kindMapP.then(function (kindMap) {
                q.when(viewP, function (view) {
                    var viewDef = "default.built-in.baseVT";
                    var tn = view.typeName || viewDef;
                    var t = typesByName[tn];
                    if (!t) {
                        t = typesByName[viewDef];
                        console.log("TypeSystem: No such Type: " + tn + " using " + viewDef)
                    }
                    if (!t) {
                        console.error("TypeSystem: Internal error: " + viewDef + " not found ")
                        d.reject("TypeSystem: Internal error: " + viewDef + " not found ");
                    } else {
                        view.type = t;
                        console.log("TypeSystem: Resolved view:" + JSON.stringify(view));
                        d.resolve(view);
                    }
                });//when
            });
        });
        return d.promise;
    };

    /**
     *
     * @param typesByNameP - promise(typeByName)
     * @param kindMapP - promise(kindMap)
     * @param relP - promise (relationship)
     * @returns { promise (relationship) }
     */
    var resolveRelationship = function (typesByNameP, kindMapP, relP) {
        var d = q.defer();
        typesByNameP.then(function (typesByName) {
            kindMapP.then(function (kindMap) {
                q.when(relP, function (rel) {
                    var relDef = "default.built-in.BaseRT";
                    var tn = rel.typeName || relDef;
                    var t = typesByName[ tn ];

                    if (!t) {
                        t = typesByName[relDef];
                        console.log("TypeSystem: No such Type: " + tn + " using " + relDef)
                    }
                    if (!t) {
                        d.reject("TypeSystem: Internal error: " + relDef + " not found ");
                    } else {
                        rel.type = t;
                        d.resolve(rel);
                    }
                });
            });
        });
        return d.promise;
    };

    var unresolve = function (thing) {
        var d = q.defer();
        thing.type = undefined;
        d.resolve(thing);
        return d.promise;
    };

    var tsObj = (  {
        typeOf: wu.curry(typeOf, allByNameP),// (item|relationship|view) -> promise(ItemType| RelationshipType| ViewType)
        isA: wu.curry(isA, hierarchyP),// (entity, type) => promise(boolean)
        hierarchy: wu.curry(getHierarchyP, allByNameP, kindMapP),// promise(Array( promise(typeName) | typeName)
        resolveItem: wu.curry(resolveItem, allByNameP, kindMapP),//{ promise (item) }
        resolveView: wu.curry(resolveView, allByNameP, kindMapP),//{ promise (view) }
        resolveRelationship: wu.curry(resolveRelationship, allByNameP, kindMapP), //{ promise (relationship) }
        unresolveItem: (unresolve),
        unresolveView: (unresolve),
        unresolveRelationship: (unresolve),
        resolveTypeName: wu.curry(resolveTypeNameWithScope, allByNameP)//// promise( full type name )
    });

    // everything exported
    module.exports = require("xtend")(tsObj);

    console.dir(["typeSystem/index.js: defined as:", (module.exports)]);
})(require("../persistence"), require("wu").wu, require("q"), require("../logger"), require("../utils"));
