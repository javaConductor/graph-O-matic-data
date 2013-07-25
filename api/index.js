/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:21 AM
 */

exports = (function(mongoose, model){

	var RelationshipCategory = model.RelationshipTypeCategory;
	var RelationshipType = model.RelationshipType;
	var Relationship = model.Relationship;
	var ItemCategory = model.ItemTypeCategory;
	var ItemType = model.ItemType;
	var Item = model.Item;
	var ViewType = model.ViewType;
	var ViewItem = model.ViewItem;
	var View = model.View;

	return {


		/// /// /// /// Item /// /// /// ///
		/// /// /// /// Item /// /// /// ///
		createItem: function(req, res){
			res.send(new Item());
		},

		/// /// /// /// View Item /// /// /// ///
		/// /// /// /// View Item /// /// /// ///
		setViewItemLocation:function(req, res){
			var id=req.params.viewItemId;
			var x = req.params.x;
			var y = req.params.y;
			model.updateViewItemPosition(id,x,y,function(err, resp){
				model.getViewItem(id, function(err, viewItem){
					res.send(viewItem);
				});
			});
		},

		/// /// /// /// View /// /// /// ///
		/// /// /// /// View /// /// /// ///
		newView: function(req, res){
			var vrId = req.params.vrId;
		}

	};
})( require('mongoose'), require("../model") );
