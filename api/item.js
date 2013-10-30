/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/23/13
 * Time: 10:45 AM
 */
(function( model, utils, q, wu ){
console.dir(["api/item.js"]);
    var reqToItem = function(req){
        var o= {};
        o.type =  req.type;
        o.title = req.title;
        o.description = req.description;
        o.data = req.data;
        return o;
    };

    var reqToItemList = function(req){
        return req.body.map( reqToItem );
    };

    var beforeSave = function (v) {
        return v;
    };
    var afterRead = function (v) {
        return v;
    };

    exports.saveItem = function(req, res){
        var item = beforeSave(req.body);
        var p = model.saveItem(item);
        p.then(function (v) {
                res.json(afterRead(v));
            }).catch(function (err) {
                    utils.sendError(res, "Error: " + err);
            });
    };

    exports.getItem = function (req, res) {
            var itemId = req.params.id;
            var p = model.getItem(itemId);
            p
                .then(function(i){
                    res.send(afterRead(i));
            })
                .catch(function(err){
                    return utils.sendError(res, "No such item:" + itemId);
            });

    };

    exports.loadItems = function(req, res){
        var items = (( req.body) );

        // get an array of promises
        var ap = items.map(wu.curry(model.saveItem, beforeSave));
        var pAll = q.all(ap)
            .then(function(pList){
                res.send(pList);
            })
            .catch(function(e){
                return utils.sendError(res, JSON.stringify(err));
            });
    };



    exports.getItems = function (req, res) {
        //var viewId = req.params.id;
        var p = model.getItems();
        p.then(function (items) {
            res.send(items.map(afterRead));
        }).catch(function (err) {
                utils.sendError(res, "Error reading items:" + err);
            });
    };


    exports.deleteItem = function(req, res){
        var id = req.params.id;

        var p = model.deleteItem(id);
        p
            .then(function(resp){
                res.send(resp)
            })
            .catch(function(e){
                utils.sendError(res, "Error deleting item:"+id+" -> " + e);
            });

    };

    exports.findItems = function(req, res){
        var searchText = req.params.searchText;
        var p = model.findItems(searchText);
        p
            .then(function(resp){
                res.send(resp)
            })
            .catch(function(e){
                utils.sendError(res, "Error finding items:"+searchText+" -> " + e);
            });

	};

})( require("../model"), require("./utils.js"), require("q"), require("wu").wu);
