/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/23/13
 * Time: 10:45 AM
 */

exports = (function(mongoose, models){

	var Item = models.ItemModel;

	return {

		createItem: function(req, res){
			res.send(new Item());
		}

	};
})( require('mongoose'), require("./models.js") );

