/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/23/13
 * Time: 10:45 AM
 */

(function(model, utils, wu, q){
    var prepItemType = function(){

    };

    var beforeSave = function (v) {
        return v;
    };
    var afterRead = function (v) {
        return v;
    };
    exports.saveItemType = function (req, res) {
        var itemData = req.body;
        var p = model.saveView(beforeSave(itemData));
        p.then(function (v) {
            res.send(afterRead(v));
        }).catch(function (err) {
                utils.sendError(res, "Error: " + err);
            });
    };

    exports.getItemType = function (req, res) {
        var itemTypeId = req.params.id;
        var p = model.getItemType(itemTypeId);
        p
            .then(function(itm){
                res.send(afterRead(itm));
            })
            .catch(function(err){
                return utils.sendError(res, "No such itemType:" + itemTypeId);
            });

    };

    exports.getItemTypes = function (req, res) {
        //var itemId = req.params.id;
        var p = model.getItemTypes();
        p.then(function (av) {
            res.send(av.map(afterRead));
        }).catch(function (err) {
                utils.sendError(res, "error reading itemTypes:" + err);
            });
    };

    exports.updateItemType = function (req, res) {
        var itemTypeData = req.body;
        var p = model.updateItemType(beforeSave(itemTypeData));
        p.then(function (v) {
            res.send((afterRead(v)));
        }).catch(function (err) {
                utils.sendError(res, "Error updating itemType:" + err);
            });
    };
})( require("../model"), require("./utils.js"),require("wu").wu, require("q") );
