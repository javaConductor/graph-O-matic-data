/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 1:58 PM
 */

exports = (function(mongoose){

	var Schema = mongoose.Schema;
	var ObjectId = mongoose.Schema.Types.ObjectId;
	var itemData = new Schema({
		name: { type: String, unique:true, required: true },
		value: { type: String, required: true },
		type: { type: String }
	});
	var positionSchema = new Schema({
		x: Number,
		y: Number
	})
	var relationshipData  = new Schema({
		name: { type: String, unique:true, required: true },
		value: { type: String, required: true },
		type: { type: String }
	});
	var durationDates = new Schema({
		start: Date,
		end: Date
	});
	var relationshipDurations = new Schema({
		currentStart: Date,
		dates:[durationDates]
	});
	var relationshipNotes = new Schema({
		date: {type: String, required:true},
		note: String
	});

	var RelationshipCategorySchema = new Schema({
		id: { type: ObjectId, required: true },
		name : String,
		parent : {type:ObjectId, ref:'RelationshipCategory'}
	});

	var constraintSchema = new Schema({
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
		parent: {type:ObjectId, ref:'RelationshipType'},
		category: {type:ObjectId, ref: 'RelationshipCategory' },
		temporal:Boolean,
		constraints: {
			To: [ {ref:'ItemType', type:ObjectId } ],
			From: [ {ref:'ItemType', type:ObjectId } ],
			ToExpression: String,
			FromExpression: String,
			FromToExpression: String
		}
	});

	var RelationshipSchema = new Schema({
		id: { type: ObjectId, unique:true, required: true },
		type: { type: ObjectId, ref:'RelationshipType', required:true},
		data:{
			name: { type: String, unique:true, required: true },
			value: { type: String, required: true },
			type: { type: String }
		},
		active: { type: Boolean, required: true },
		fromItem: { type: String, required: true },
		toItem: { type: String, required: true },
		durations: {
			start: Date,
			end: Date
		},
		notes: {
			date: {type: String, required:true},
			note: String
		}
	});
	var ItemTypeSchema = new Schema({
		id: { type: ObjectId, required: true },
		name : { type: String },
		title: { type: String, required: false },
		description: { type: String },
		parent: {type:ObjectId, ref:'ItemType'},
		category: {type:ObjectId, ref: 'RelationshipCategory' },
		properties: [{
			simpleProperty: true,

			// THIS
			type: String,
			required: Boolean,

			//OR THIS
			relationshipTypes : [{ref: "RelationshipType", type:ObjectId}],
			itemTypes : [{ref: "ItemType", type:ObjectId}],

			description: { type: String, required: true }
		}],
		defaults:[{
			name: String,
			value: String,
			fixed: Boolean
		}],
		allowExtraProperties: Boolean
	});

	var ItemSchema = new Schema({
		id: { type: ObjectId, required: true },
		type : { type: ObjectId, ref: 'ItemType' },
		title: { type: String, required: false },
		description: { type: String },
		relatedImages: [{ type: String }],
		relationships: [{ type: ObjectId, ref: 'Relationship' }], /// ids only
		data: {
			name: { type: String, unique:true, required: true },
			value: { type: String, required: true },
			type: { type: String }
		}
	});

	var ViewItemSchema = new Schema({
		id: ObjectId,
		item: { type: ObjectId, ref: 'Item', required:true },
		position: {
			x: Number,
			y: Number
		},
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
		type: {ref:'ViewType', type:ObjectId, required: true},
		items: [{ type: ObjectId, ref:'ViewItem', required: true }]
	});

	/// MODELS
	return {
		Item: mongoose.model('Item', ItemSchema),
		ItemType: mongoose.model('ItemType', ItemTypeSchema),
		Relationship: mongoose.model('Relationship', RelationshipSchema),
		ViewType:  mongoose.model('ViewType', ViewTypeSchema),
		ViewItem:  mongoose.model('ViewItem', ViewItemSchema),
		View: mongoose.model('View', ViewSchema)
	};

})(require("mongoose"));
