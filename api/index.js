/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:21 AM
 */

var mergeModule = function(modPath){
    var pa = require( modPath );

    console.dir(["Loaded "+modPath+" ==>",   (pa)]);
    for (var name in pa)
    {
       // console.log("Adding "+name+" to module.");
        exports[ name ] = pa[ name ];
    }
};

mergeModule( "./view.js");
mergeModule( "./viewItem.js");
mergeModule( "./item.js");
mergeModule( "./itemType.js");

console.dir(
    (exports)
);
