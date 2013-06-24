/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:21 AM
 */

exports = (function(mongoose, models){

	var Item = models.ItemModel;

	return {

		createItem: function(req, res){
			res.send(new Item());
		},

		setViewItemLocation:function(req, res){
			var x = req.params.x;
			var y = req.params.y;
			Item.find({ id: itemId }).exec(function(err, item){
				res.send(new ViewItem());


			});
		},

		newView: function(req, res){
			var vrId = req.params.vrId;
		}

	};
})( require('mongoose'), require("./models.js") );

