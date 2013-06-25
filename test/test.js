/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 4/23/13
 * Time: 7:04 PM
 */
var assert = require("assert");
var should = require("should");
var request = require("superagent");
var mongoose = require('mongoose');
var models = require('../api/models.js');

describe('Mongo Persistence Test', function(){

	describe('should create itemType', function(){

		it("should return the string.", function(done){
			var itemType = new models.ItemType;
			itemType.id = "--default--";
			itemType.name = "BasicItem";
			itemType.title = "Basic Item";
			itemType.description = "";
			itemType.properties = [

			];
			itemType.allowExtraProperties = true;
			itemType.save( function(err, itype) {
				should.not.exist(err);
				console.dir(["new ItemType>>", itype]);
			});
		});

	})

});
