/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:21 AM
 */

(function (model, utils, q) {

    var beforeSave = function (v) {
        return v;
    };
    var afterRead = function (v) {
        return v;
    };
    exports.saveViewAsync = function (req, res) {
        var viewData = req.body;
        model.saveView(beforeSave(viewData), function (err, v) {
            if (err) {
                return utils.sendError(res, "Error: " + err);
            }
            res.send(afterRead(v));
        });
    };

    exports.saveView = function (req, res) {
        var viewData = req.body;
        var p = model.saveView(beforeSave(viewData));
        p.then(function (v) {
            res.send(afterRead(v));
        }).catch(function (err) {
                utils.sendError(res, "Error: " + err);
            });
    };

    exports.getViewAsync = function (req, res) {
        var viewId = req.params.id;
        model.getView(viewId, function (err, v) {
            if (err)
                return utils.sendError(res, "No such view:" + viewId);
            res.send(afterRead(v));
        });
    };


    exports.getView = function (req, res) {
        var viewId = req.params.id;
        var p = model.getView(viewId);

        p
            .then(function(v){
                res.send(afterRead(v));
            })
            .catch(function(err){
                return utils.sendError(res, "No such view:" + viewId);
            });

    };

    exports.getViews = function (req, res) {
        //var viewId = req.params.id;
        var p = model.getViews();
        p.then(function (av) {
            res.send(av.map(afterRead));
        }).catch(function (err) {
                utils.sendError(res, "error reading views:" + err);
            });
    };
    exports.getViewsAsync = function (req, res) {
        //var viewId = req.params.id;
        model.getViews(function (err, av) {
            if (err)
                return utils.sendError(res, "error reading views:" + err);
            res.send(av.map(afterRead));
        });
    };

    exports.updateView = function (req, res) {
        var viewData = req.body;
        model.updateView(beforeSave(viewData), function (err, v) {
            if (err)
                return utils.sendError(res, "Error: " + err);
            res.send(afterRead(v));
        });
    };

    console.log("viewApi:" + JSON.stringify(exports));
})(require("../model"), require("./utils.js"), require("q"));
