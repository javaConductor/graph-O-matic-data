/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:21 AM
 */

(function( utils, model ){

    exports.getViewItem = function(req, res){
        var  itemId = req.params.id;
        model.getViewItem(itemId, function(err, vItem){
            if (err)
                return utils.sendError(res, err);
            res.send(vItem);
        });
    };

    exports.createViewItem = function(req, res){
        var  itemId = req.params.itemId;
        var posX = req.params.x;
        var posY = req.params.y;
        var viewId= req.params.viewId;
        model.createViewItem(viewId,itemId, posX, posY, function(err, vItem){
            if (err)
                return utils.sendError(res, err);
            res.send(vItem);
        });
    };

    exports.updateViewItemPosition = function(req, res){
			var x = req.params.x;
			var y = req.params.y;
			var vid = req.params.viewItemId;
            model.updateViewItemPosition(vid,x,y, function(err, item){
                if (err)
                    return utils.sendError(res, err);
                item.position.x = x;
				item.position.y = y;
				res.send(item);
			});
		};

})( require('./utils.js'), require("../model") );