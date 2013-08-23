/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/25/13
 * Time: 1:47 AM
 */
(function(nodeExtend){
	exports.extend = nodeExtend.extend;

    exports.mergeModule= function(mod, modName){
        var pa = require( modName );
        for (var name in pa)
        {
            mod.exports[ name ] = pa[ name ];
        }
    };

})(require("node-extend"));
