/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:21 AM
 */

exports = (function(mongoose, models){

	var ViewItem = models.ViewItem;

	return {

		setViewItemLocation:function(req, res){
			var x = req.params.x;
			var y = req.params.y;
			var vid = req.params.viewItemId;

			ViewItem.find({ id: vid }).exec(function(err, item){
				item.position.x = x;
				item.position.y = y;
				res.send(item);
			});
		}

	};
})( require('mongoose'), require("./models.js") );

