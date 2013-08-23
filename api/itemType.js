/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/23/13
 * Time: 10:45 AM
 */

(function(model){
    var prepItemType = function(){

    };

    exports.getItemType=function(req, res){

        model.getItemType(req.params.context, req.params.area, req.params.name, function(err, itype){
            res.send(itype);
        });
    };

    exports.getItemTypes=function(req, res){

        console.dir(model);
        model.getItemTypes( function(err, itypes){
            res.send(itypes);
        });
    };
        exports.getItemTypeById= function(req, res){
            model.getItemTypeById(req.params.id, function(err, itype){
                res.send(itype);
            });
        };

})( require("../model") );

