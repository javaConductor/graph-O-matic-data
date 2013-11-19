/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:21 AM
 */

(function (model, utils, q) {

    var beforeSave = function (v) {
        return v;
    };
    var afterRead = function (v) {
        return v;
    };

    exports.saveView = function (req, res) {
        var viewData = req.body;
        var p = model.saveView(beforeSave(viewData));
        p.then(function (v) {
            res.json(afterRead(v));
        }).catch(function (err) {
                utils.sendError(res, "Error: " + err);
        });
    };

    exports.getView = function (req, res) {
        var viewId = req.params.id;
        var p = model.getView(viewId);
        p
            .then(function(v){
                res.send(afterRead(v));
            })
            .catch(function(err){
                return utils.sendError(res, "No such view:" + viewId);
            });

    };

    exports.getViews = function (req, res) {
        //var viewId = req.params.id;
        var p = model.getViews();
        p.then(function (avP) {

            q.all(avP).then( function(av){
                res.send(av.map(afterRead));
            });

        }).catch(function (err) {
                utils.sendError(res, "error reading views:" + err);
            });
    };

    exports.updateView = function (req, res) {
        var viewData = req.body;
        var p = model.updateView(beforeSave(viewData));
        p.then(function (v) {
            res.send((afterRead(v)));
        }).catch(function (err) {
                utils.sendError(res, "Error updating viewType:" + err);
            });
    };

    var loadInlineItem = function( view ){
        // each view item
        var pViewItems = view.items.map(function(vitem){
            return loadInlineViewItem(vitem);
            });
        return q.all(pViewItems,function(viewItems){
            view.items = viewItems;
            return view;
        });
    };

    /**
     *
     * @param vitem
     *
     * @returns promise(vitem)
     */
    var loadInlineViewItem = function( vitem ){

        // transform the item into an promise(ObjectId)
        var pItem = (typeof vitem.item === 'object')
            ? model.saveItem(vitem.item)
            : model.getItem(vitem.item);

        return pItem.then(function(item){
            vitem.item = item.id;
            return vitem;
        });
    };

    var loadInlineItems = function( views ){
        // each view
        return views.map(function(v){
            return loadInlineItem(v);
        });
    };

    exports.loadViews = function(req, res){
        var theViews = (( req.body) );
        //// insert any inline items
        loadInlineItems(theViews)
            .then(function(views){
                // get an array of promises
                var vp = views.map(function(vw){
                    vw = beforeSave(vw);
                    return model.saveView(vw);
                });

                q.all(vp)
                    .then(function(vList){
                        res.send(vList);
                    })
                    .catch(function(e){
                        return utils.sendError(res, JSON.stringify(e));
                    });
            });

    };

    console.log("viewApi:" + JSON.stringify(exports));
})(require("../model"), require("./utils.js"), require("q"));
