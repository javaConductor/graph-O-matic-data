/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 4/23/13
 * Time: 7:04 PM
 */
var assert = require("assert");
var request = require("superagent");
var mongoose = require('mongoose');
var models = require('../api/models.js');

describe('Mongo Persistence Test', function(){

	describe('when I call Mongo Persistence', function(){

		it("should return the string.", function(done){
			request.post("http://localhost:4242/api")
			  .end(function(res){
				  assert.ok(res, "response == null");
				 // assert.equal( 200, res.status );
			  })
		});

	})

});
