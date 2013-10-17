/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:21 AM
 */

(function(model, utils){

    var beforeSave = function(v){return v;};
    var afterRead = function(v){ return v;};
    exports.saveView = function(req, res){
        var viewData = req.body;
        model.saveView(beforeSave(viewData), function(err, v){
            if ( err ){
                return utils.sendError(res,"Error: "+err);

            }
            res.send(afterRead(v));
        });
    };

    exports.getView = function(req, res){
        var viewId = req.params.id;
        model.getView(viewId, function(err, v){
            if ( err )
                return utils.sendError(res,"No such view:"+viewId);
            res.send(afterRead(v));
        });
    };

    exports.getViews = function(req, res){
        //var viewId = req.params.id;
        model.getViews(function(err, av){
            if ( err )
                return utils.sendError(res,"error reading views:"+err);
            res.send( av.map(afterRead));
        });
    };

    exports.updateView = function(req, res){
            var viewData = req.body;
            model.updateView(beforeSave(viewData), function(err, v){
                if ( err )
                    return utils.sendError(res,"Error: "+err);
                res.send(afterRead(v));
            });
        };

    console.log("viewApi:"+JSON.stringify(exports));
})( require("../model"),require("./utils.js") );

