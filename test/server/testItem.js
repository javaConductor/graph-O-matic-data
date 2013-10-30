/**
 * Spacely Text & Binary Goods Inc.
 *
 * User: lcollins
 * Date: 10/27/13
 * Time: 5:36 PM
 *
 */

var request = require('supertest');
var app = require("../../server.js");

var itm = {
    title: "Test Item",
    typeName: "baseIT",
    description: "This is a real testoid item."
};

request(app)
    .put('/items')
    .expect('Content-Type', /json/)
    .send(itm)
    //.expect('Content-Length', '20')
    .expect(200)
    .end(function(err, res){
        if (err) throw err;
        console.dir(["/items: End:", res.body]);
        process.exit();
    });
