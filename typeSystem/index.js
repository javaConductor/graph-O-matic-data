/**
 * Spacely Text and Binary Goods Inc
 *
 * User: lee
 * Date: 8/4/13
 * Time: 2:16 AM
 */
(function (model, async, wu) {

    var ret = {};
    var createDependencies = function createDependencies(typesByName, typeMap) {
        typesByName.forEach(function (t, name) {
            ret[name] = getHierarchy(name, typesByName, typeMap);
        });
        return ret;
    };

    function reportError(msg){
        throw {error:msg};
    }

    var  defaultParentForType =function defaultParentForType(type){
        switch (type){

            case "itemType":
                return 'default.built-in.baseIT';

           case "relationshipType":
                        return 'default.built-in.baseRT';

           case "viewType":
                        return 'default.built-in.baseVT';
        }

    }
    /**
     * Returns a list containing this type and its ancestry
     *
     * @param type
     */
    var getHierarchy = function getHierarchy(typesByName,typeMap,  type, listSoFar) {
        listSoFar = listSoFar || [type];
        var t = typesByName[type];
        if (t) {
            var parent = (t.parent);
            if (!parent) {
                var defaultForType = defaultParentForType(typeMap[type]);
                if (listSoFar.indexOf(defaultForType) == -1)
                    listSoFar.push("default.built-in");
                return listSoFar;
            }
            listSoFar.push(parent);
            return getHierarchy(parent, typesByName, listSoFar);
        }
        else
            return reportError( {error: "No such type: " + type});
    };

    async.parallel([
        function (callback) {
            model.getItemTypes(callback);
        },
        function (callback) {
            model.getRelationshipTypes(callback);
        },
        function (callback) {
            model.getViewTypes(callback);
        }
    ],
// optional callback
        function (err, results) {
            if (err)
                throw err;

            //// Create the byName maps for lookup
            var allTypesByName = {};
            var typeMap = {};
            var itemTypesByName = {};
            results[0].forEach(function (it) {
                itemTypesByName[it.origin.context + "." + it.origin.area + "." + it.origin.name] = it;
                allTypesByName[it.origin.context + "." + it.origin.area + "." + it.origin.name] = it;
                typeMap[it.origin.context + "." + it.origin.area + "." + it.origin.name] = "itemType";
            });

            var relationshipTypesByName = {}
            results[0].forEach(function (it) {
                relationshipTypesByName[it.origin.context + "." + it.origin.area + "." + it.origin.name] = it;
                allTypesByName[it.origin.context + "." + it.origin.area + "." + it.origin.name] = it;
                typeMap[it.origin.context + "." + it.origin.area + "." + it.origin.name] = "relationshipType";
            });

            var viewTypesByName = {}
            results[0].forEach(function (vt) {
                viewTypesByName[vt.origin.context + "." + vt.origin.area + "." + vt.origin.name] = vt;
                allTypesByName[vt.origin.context + "." + vt.origin.area + "." + vt.origin.name] = vt;
                typeMap[vt.origin.context + "." + vt.origin.area + "." + vt.origin.name] = "viewType";
            });

            var typeOf = (function typeOf(itemTypesByName, relTypesByName, viewTypesByName, typeName) {

                ////

            }  );

            var deps = createDependencies( allTypesByName, typeMap );
            var isA = function isA(deps, entity, typeName) {

                ////
               var hierarchy =  getHierarchy(allTypesByName, typeMap, entity.type.name);
                if(!hierarchy)
                    return reportError("No such type: " +entity.type.name);

                return hierarchy.indexOf(typeName) != -1;

            };

            module.exports = {
                typeOf: typeOf,// (item|relationship|view) -> (ItemType, RelationshipType, ViewType)
                isA: isA,
                hierarchy: wu.curry(getHierarchy, allTypesByName, typeMap)

            }

        });


})(require("./model"), require("async"), require("wu"));
