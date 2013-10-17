/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/23/13
 * Time: 10:45 AM
 */
(function( model, utils ){
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

    var prepItemRead = function(item){
        return (item);
    };

    var prepItemsRead= function prepItems(items){
        return items.map( prepItemRead );
    };

    var prepItemWrite = function(item){
        return item;
    };

    var prepItemsWrite= function prepItems(items){
        return items.map( prepItemWrite );
    };

    exports.saveItem = function(req, res){
        var item = prepItemWrite(req.body);
        model.saveItem(item, function(err, itm){
                if(err)
                    return utils.sendError(res, JSON.stringify(itm));
                res.send(itm);

        });
    };

    exports.loadItems = function(req, res){
        var items = prepItemsWrite(( req.body) );
            items.forEach(function(item){
                model.saveItem(item, function(err, itm){
                    if(err)
                        return utils.sendError(res, JSON.stringify(err));
                    res.send(itm);
                });
        });
    };

    exports.getItem = function(req, res){
        var id = req.params.id;
        model.getItem(id, function(err, itm){
            res.send(itm);
        });
    };

    exports.getItems = function(req, res){
       // var id = req.params.id;
        model.getItems( function(err, itms){
            res.send(itms);
        });
    };

    exports.deleteItem = function(req, res){
        var id = req.params.id;
        model.deleteItem(id, function(err, resp){
            res.send(resp);
        });
    };

    exports.findItems = function(req, res){
        var searchText = req.params.searchText;
        model.findItems(searchText, function(err, items){
            res.send(items);
        });
	};

})( require("../model"), require("./utils.js"));
