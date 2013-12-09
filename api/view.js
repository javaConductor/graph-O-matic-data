/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:21 AM
 */
(function (model, utils, q, ts, viewLoader) {

    var beforeSave = function (v) {
        return v;
    };
    var afterRead = function (v) {
        return v;
    };


    /// creates NEW view for FIRST time
    exports.saveView = function (req, res) {
        var viewData = req.body;
        var p = model.saveView(beforeSave(viewData));
        p.then(function (v) {
            res.json(afterRead(v));
        }).catch(function (err) {
                utils.sendError(res, "Error: " + err);
        });
    };

    /// returns the
    exports.getView = function (req, res) {
        var viewId = req.params.id;
        var p = model.getView(viewId);
        p
            .then(function(v){
                res.json(v);
            })
            .catch(function(err){
                return utils.sendError(res, "No such view:" + viewId);
            });
    };

    exports.getViews = function (req, res) {
        var p = model.getViews()
            .then(function (avP) {
                q.all(avP)
                    .then( function(av){
                    res.send(av.map(afterRead));
                });
            })
            .catch(function (err) {
                utils.sendError(res, "error reading views:" + err);
            });
    };

    exports.updateView = function (req, res) {
        var viewData = req.body;
        var p = model.updateView(beforeSave(viewData));
        p.then(function (v) {
            res.send((afterRead(v)));
        }).catch(function (err) {
                utils.sendError(res, "Error updating viewType:" + err);
            });
    };

    exports.loadViews = function(req, res){
        var loadObject = (( req.body) );

        viewLoader.load(loadObject, beforeSave)
            .then(function( vList ){
                console.log( "api.view.loadViews: loaded: "+JSON.stringify(vList) );
                res.json( vList );
            })
            .catch(function( e ){
                console.error("api.loadViews() -> " + e ) ;
                return utils.sendError( res, e );
            });
    };
//    console.log("viewApi:" + JSON.stringify(exports));
})(require("../model"), require("./utils.js"), require("q"), require("../typeSystem"),require("./viewLoad.js"));
