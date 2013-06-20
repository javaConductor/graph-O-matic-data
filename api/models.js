/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 1:58 PM
 */

exports = (function(mongoose){

	var Schema = mongoose.Schema;
	var ObjectId = mongoose.Schema.Types.ObjectId;
	var ItemData = new Schema({
		name: { type: String, unique:true, required: true },
		value: { type: String, required: true },
		type: { type: String }
	});

	var RelationshipData  = new Schema({
		name: { type: String, unique:true, required: true },
		value: { type: String, required: true },
		type: { type: String }
	});

	var DurationDates = new Schema({
		start: Date,
		end: Date
	});

	var RelationshipDurations = new Schema({
		currentStart: Date,
		dates:[DurationDates]

	});
	var RelationshipNotes = new Schema({
		date: {type: String, required:true},
		note: String
	});
	var Relationship = new Schema({
		id: { type: String, unique:true, required: true },
		type: { type: String, required:true},
		data:[RelationshipData],
		active: { type: Boolean, required: true },
		fromItem: { type: String, required: true },
		toItem: { type: String, required: true },
		durations: RelationshipDurations,
		notes: [RelationshipNotes ]
	});
	var Item = new Schema({
		id: { type: String, required: true },
		title: { type: String, required: false },
		description: { type: String },
		relatedImage: [{ type: String }],
		relationships: [Relationship],
		data: [ItemData]
	});

	var ItemModel = mongoose.model('Item', Item);
	var RelationshipModel = mongoose.model('Relationship', Relationship);

	return {
		itemModel: ItemModel,
		relationshipModel: RelationshipModel
	};

})(require("mongoose"));

