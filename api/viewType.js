/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:21 AM
 */

(function(model, utils){


        exports.saveView = function(req, res){
            var viewData = req.body;

            model.saveView(viewData, function(err, v){
                res.send(v);
            });
        };

    exports.getView = function(req, res){
        var viewId = req.params.id;
        model.getView(viewId,function(err, v){
            if ( err )
                return utils.sendError(res,"no such view:"+viewId);
            res.send(v);
        });
    };

    exports.getViews = function(req, res){
        //var viewId = req.params.id;
        model.getViews(function(err, v){
            if ( err )
                return utils.sendError(res,"no such view:"+viewId);
            res.send(v);
        });
    };

    exports.updateView = function(req, res){
            var viewData = req.body;
            model.updateView(viewData, function(err, v){
                if ( err )
                    return utils.sendError(res,"Error: "+err);

                res.send(v);
            });
        };

    console.log("viewApi:"+JSON.stringify(exports));
})( require("../model"),require("./utils.js") );

