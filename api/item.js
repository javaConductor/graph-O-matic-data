/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/23/13
 * Time: 10:45 AM
 */

(function( model, utils ){

    var reqToItem = function(req){
        var o= {};
        o.type =  req.body.type;
        o.title = req.body.title;
        o.description = req.body.description;
        o.data = req.body.data;
        return o;
    };
    var prepItem = function(item, f){
        if ("string" == typeof  item.type ){
            model.getItemTypeByName(item.type, function(e, itype){
                if (e)
                    return f(e, null)
                item.type = itype;
                return f( null, item );
            });
        }
    };

    exports.saveItem = function(req, res){
        prepItem( reqToItem(req), function(err, item){
            model.saveItem(item, function(err, itm){
                if(err)
                    return utils.sendError(res, JSON.stringify(itm));
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

    exports.findItems = function(req, res){
        var searchText = req.params.searchText;
        model.findItems(searchText, function(err, items){
            res.send(items);
        });
	};

})( require("../model"), require("./utils.js") );
