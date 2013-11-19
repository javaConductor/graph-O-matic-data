/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/25/13
 * Time: 1:47 AM
 */
(function(extend){
	exports.extend = extend;

    exports.mergeModule= function(mod, modName){
        var pa = require( modName );
        for (var name in pa)
        {
            mod.exports[ name ] = pa[ name ];
        }
    };

    exports.mapBy=function (key, objectArray) {
        var destination = {};
        if (objectArray)
            for (var idx in objectArray) {
                if (objectArray[idx][key])
                    destination[objectArray[idx][key]] = objectArray[idx];
            }
        return destination;
    };

    exports.unique = function(a) {
        var o = {}, i, l = a.length, r = [];
        for(i=0; i<l;i+=1) o[a[i]] = a[i];
        for(i in o) r.push(o[i]);
        return r;
    };

})(require("extend"));
