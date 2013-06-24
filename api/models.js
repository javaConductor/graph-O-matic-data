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

	var RelationshipCategorySchema = new Schema({
		id: { type: ObjectId, unique:true, required: true },
		name : String,
		parent : {type:ObjectId, ref:'RelationshipCategory'}
	});

	var ConstraintSchema = new Schema({
		To: [{ref:'ItemType' , type:ObjectId  }],
		From: [{ref:'ItemType' , type:ObjectId  }],
		ToExpression: String,
		FromExpression: String,
		FromToExpression: String
	});
	var RelationshipTypeSchema = new Schema({
		id: { type: ObjectId, unique:true, required: true },
		name : String,
		composite: Boolean,
		bidirectional: Boolean,
		reciprocalRelationship: {type:ObjectId, ref: 'RelationshipType' },
		parent: {type:ObjectId, ref:'RelationshipTypeSchema'},
		category: RelationshipCategorySchema,
		temporal:Boolean,
		constraints: ConstraintSchema
	});
	var RelationshipSchema = new Schema({
		id: { type: ObjectId, unique:true, required: true },
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
		type : { type: ObjectId, ref: 'ItemType' },
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

	var ViewTypeSchema  = new Schema({
		id: { type: ObjectId, unique:true, required: true },
		name:String,
		itemTemplateURL:String,
		relationshipTemplateURL:String,
		cssFiles: [String],
		title:String
	});

	var ViewSchema = new Schema({
		id: { type: ObjectId, unique:true, required: true },
		name: {type: String, required: true},
		type: {ref:'ViewType', type:ObjectId},
		items: [ViewItemSchema]
	});


	/// MODELS
	var ItemModel = mongoose.model('Item', ItemSchema);
	var RelationshipModel = mongoose.model('Relationship', RelationshipSchema);
	var ViewTypeModel = mongoose.model('ViewType', ViewTypeSchema);
	var ViewModel = mongoose.model('View', ViewSchema);
	return {
		Item: ItemModel,
		Relationship: RelationshipModel,
		ViewType: ViewTypeModel,
		View: ViewModel
	};

})(require("mongoose"));
