/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:21 AM
 */

(function(model, utils){
    var beforeSave = function (v) {
        return v;
    };
    var afterRead = function (v) {
        return v;
    };

    exports.saveViewType = function (req, res) {
        var viewData = req.body;
        var p = model.saveView(beforeSave(viewData));
        p.then(function (v) {
            res.send(afterRead(v));
        }).catch(function (err) {
                utils.sendError(res, "Error: " + err);
            });
    };


    exports.getViewType = function (req, res) {
        var viewTypeId = req.params.id;
        var p = model.getViewType(viewTypeId);
        p
            .then(function(v){
                res.send(afterRead(v));
            })
            .catch(function(err){
                return utils.sendError(res, "No such viewType:" + viewTypeId);
            });

    };

    exports.getViewTypes = function (req, res) {
        var p = model.getViewTypes();
        p.then(function (av) {
            res.send(av.map(afterRead));
        }).catch(function (err) {
            utils.sendError(res, "error reading viewTypes:" + err);
        });
    };

    exports.updateViewType = function (req, res) {
        var viewTypeData = req.body;
        var p = model.updateViewType(beforeSave(viewTypeData));
        p.then(function (v) {
            res.send((afterRead(v)));
        }).catch(function (err) {
                utils.sendError(res, "Error updating viewType:" + err);
            });
    };

    console.log("viewTypeApi:"+JSON.stringify(exports));
})( require("../model"),require("./utils.js") );

