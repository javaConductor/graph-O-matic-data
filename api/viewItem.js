/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:21 AM
 */

(function( utils, model ){

    var beforeSave = function (v) {
        return v;
    };
    var afterRead = function (v) {
        return v;
    };

    exports.saveViewItem = function (req, res) {
        var viewItemData = req.body;
        var p = model.saveViewItem(beforeSave(viewItemData));
        p.then(function (v) {
            res.send(afterRead(v));
        }).catch(function (err) {
                utils.sendError(res, "Error: " + err);
            });
    };

    exports.getViewItem = function (req, res) {
        var viewItemId = req.params.id;
        var p = model.getViewItem(viewItemId);

        p
            .then(function(v){
                res.send(afterRead(v));
            })
            .catch(function(err){
                return utils.sendError(res, "No such viewItem:" + viewItemId);
            });

    };

    exports.createViewItem = function(req, res){
        var  newViewItem  = req.body;
        var p = model.createViewItem(
            newViewItem.viewId,
            newViewItem.item,
            newViewItem.position )
        .then(function(v){
            res.send(afterRead(v));
        })
        .catch(function(err){
            return utils.sendError(res, "Could not create viewItem for view:" + newViewItem.viewId);
        });
    };

    exports.updateViewItem = function(req, res){
        var  newViewItem  = req.body;
        var p = model.createViewItem(
                newViewItem.viewId,
                newViewItem.item,
                newViewItem.position )
            .then(function(v){
                res.send(afterRead(v));
            })
            .catch(function(err){
                return utils.sendError(res, "Could not update viewItem for view:" + newViewItem.viewId);
            });
    };

    exports.updateViewItemPosition = function(req, res){
			var x = req.params.x;
			var y = req.params.y;
			var itemId = req.params.id;
            var viewItemId = req.params.viewItemId;
            return model.updateViewItemPosition(viewItemId,x,y)
                .then( function(err, vitem){
                   if (err)
                        return utils.sendError(res, err);
                    res.send(vitem);
			    });
		};

})( require('./utils.js'), require("../model") );
