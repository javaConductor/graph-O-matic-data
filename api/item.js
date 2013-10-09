/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/23/13
 * Time: 10:45 AM
 */

(function( model, utils ){

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

    var prepItem = function(item, f){
        if ("string" == typeof  item.type ){
            model.getItemTypeByName(item.type, function(e, itype){
                if (e)
                    return f(e, null);
                console.log("prepItem(): "+item.type + "==>>"+ JSON.stringify( itype));
                item.type = itype;
                return f( null, item );
            });
        }
    };

    var prepItems= function prepItems(items, f, itemsPrepped){
        itemsPrepped = itemsPrepped || [];
        var err = null;
        /// if no more items - we're done!
        if (items.length == 0)
            return f(null, itemsPrepped);
        var item = items[0];
        return prepItem(item,function(e,itm){
            if(e){
                return f(e, null);
            }
            var nuItems = items.slice(1);
            itemsPrepped.push(itm);
            return prepItems(nuItems,f,itemsPrepped);
        });
    };

    exports.saveItem = function(req, res){
        prepItem( reqToItem(req.body), function(err, item){
            model.saveItem(item, function(err, itm){
                if(err)
                    return utils.sendError(res, JSON.stringify(itm));
                res.send(itm);
            });
        });
    };

    exports.loadItems = function(req, res){
        var itemList = reqToItemList( req );
        prepItems( itemList, function(err, items){
            items.forEach(function(item){
                model.saveItem(item, function(err, itm){
                    if(err)
                        return utils.sendError(res, JSON.stringify(itm));
                    res.send(itm);
                });
            });
        });
    };

    exports.getItem = function(req, res){
        var id = req.params.id;
        model.getItem(id, function(err, itm){
            res.send(itm);
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

})( require("../model"), require("./utils.js") );
