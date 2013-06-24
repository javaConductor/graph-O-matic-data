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
	var PositionSchema = new Schema({
		x: Number,
		y: Number
	})
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

	var RelationshipTypeSchema = new Schema({
		name : String,
		composite: Boolean,
		bidirectional: Boolean,
		reciprocalRelationship: {type:ObjectId, ref: 'RelationshipType' },
		parent: RelationshipTypeSchema,
		category: RelationshipCategory

	});
	var RelationshipSchema = new Schema({
		id: { type: String, unique:true, required: true },
		type: { type: ObjectId, ref:'RelationshipType', required:true},
		data:[RelationshipData],
		active: { type: Boolean, required: true },
		fromItem: { type: String, required: true },
		toItem: { type: String, required: true },
		durations: [RelationshipDurations],
		notes: [ RelationshipNotes ]
	});
	var ItemSchema = new Schema({
		id: { type: ObjectId, required: true },
		type : { type: Schema.ObjectId, ref: 'ItemType' },
		title: { type: String, required: false },
		description: { type: String },
		relatedImage: [{ type: String }],
		relationships: [String], /// ids only
		data: [ItemData]
	});

	var ViewItemSchema = new Schema({
		id: ObjectId,
		item: { type: ObjectId, ref: 'Item', required:true },
		position: PositionSchema,
		selected: Boolean
	});


	var viewSchema = new Schema({
		name: {type: String, required: true},
		items: [ViewItemSchema]
	});


	/// MODELS
	var ItemModel = mongoose.model('Item', ItemSchema);
	var RelationshipModel = mongoose.model('Relationship', RelationshipSchema);

	var ViewModel = mongoose();
	return {
		Item: ItemModel,
		Relationship: RelationshipModel,
		View: ViewModel
	};

})(require("mongoose"));
