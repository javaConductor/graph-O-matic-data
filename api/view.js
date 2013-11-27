/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 6/20/13
 * Time: 12:21 AM
 */

(function (model, utils, q, ts) {

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

//                var r = {
//                    "id": v.id,
//                    "name": v.name,
//                    "description": v.description,
//                    "items": {"$href": "/views/"+ v.id+"/items"}
//                };

                res.json(v);
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

    /// promise(view)
    var loadInlineItem = function( view ){
        // each view item
        var pViewItems = view.items.map(function(vitem){
            return loadInlineViewItem(vitem);
            });
        return q.all(pViewItems).then(function(viewItems){
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
        //TODO: transform the item data
        // transform the item into an promise(ObjectId)
        var pItem = (typeof vitem.item === 'object')
            ? model.saveItem(vitem.item)
            : model.getItem(vitem.item);

        return pItem.then(function(item){
            vitem.item = item;//  ??? .id;
            return vitem;
        });
    };

    /**
     *
     * @param views
     * @returns {Array(promise(view)) }
     */
    var loadInlineItems = function( views ){
        // each view
        return views.map(function(v){
            return loadInlineItem(v);
        });
    };


    /**
     *
     * @param variables
     * @param view
     *
     * @returns (view)
     */
    var bindRelatedItemsToView = function(variables, view){
        var viewItems = view.items.map(function( viewItem){
            viewItem.item = bindRelatedItemsToData( variables, viewItem.item );
            return viewItem;
        });
        view.items = viewItems;
        return view;
    };

    /**
     *
     * @param variables
     * @param item
     *
     * @returns  (item)
     */
    var bindRelatedItemsToData = function(variables, item){
        if (item.data && item.data.length > 0){
            var nuData = item.data.reduce(function(acc, propertyData){
                var k = propertyData.name;
                // is this a variable reference ?
                if(propertyData["$VAR"]){
                    var varName = propertyData["$VAR"];
                    var varVal = variables[varName];
                    if(!varVal){
                        throw new Error("No such variable: "+varName);
                    }
                    acc.push( varVal );
                }else if( false && typeof propertyData === 'object' ) {//TODO: Implement this condition!!

                }else{
                    acc.push( propertyData);
                }
                return acc;
            }, []);
            item.data = nuData;
            return item;
        }else{
            return item;
        }
    };

    /**
     * @param varName
     * @param relatedItemObj
     * @returns promise( varName:Array(ObjectId | object id) )
     */
    var loadRelatedItemList = function(varName, relatedItemObj){
        var criteria = {};
        if(relatedItemObj.criteria.id){
            criteria = {
                _id: relatedItemObj.criteria.id,
                typeName: relatedItemObj.typeName
            }
        }else{
            criteria = relatedItemObj.criteria;
            criteria["typeName"] = relatedItemObj.typeName;
        }

        return model.findItems(criteria)
            .then(function(items){

                if (items.length === 0){
                    var msg = "Could not load variable '"+varName+"': no matching items of type "+relatedItemObj.typeName+" found.";
                    console.error("api.view.loadRelatedItemList("+varName+"): "+msg);
                    throw new Error(msg);
                }
                return items.reduce(function(acc, item, index){
//                return items.map(function(item){
                    acc[varName] = acc[varName] || [];
                    acc[varName].push(item.id);
                    return acc;
                }, {});
            });
    };

    /**
     *
     * @param relatedItemsObj
     * @returns promise( varName:Array(ObjectId | object id) )
     */
    var loadRelatedItems = function(relatedItemsObj){
        var relKeys = Object.keys(relatedItemsObj);
        var aRelItemsP = relKeys.map(function( relKey ){
            var relItem = relatedItemsObj[relKey];
            return  loadRelatedItemList(relKey, relItem);
        });

        return q.all(aRelItemsP).then( function(aRelItems){
            /// maybe here is where we should check for missing items
            //aRelItems.filter(function(relItem){ return relItem })
            return aRelItems.reduce(function(acc, relItem){
                return utils.extend(acc, relItem);
            },{});
        }).catch(function(e){
                console.error("api.view.loadRelatedItems: Could not load related items: " + e );
                throw new Error("api.view.loadRelatedItems: Could not load related items: " + e);
            });
    };

    exports.loadViews = function(req, res){
        var loadObject = (( req.body) );
        var theViews = loadObject.views || [];
        var vars = loadObject.variables || {};

        loadRelatedItems(vars)
            .then(function(variables){
                theViews = theViews.map(function( vw ){
                    return bindRelatedItemsToView( variables, vw);
                });

            //// insert any inline items
            var ap=loadInlineItems(theViews);
                q.all(ap).then( function(views){

                    console.log("api.loadViews():"+JSON.stringify(views));

                    // get an array of promises
                    var vp = views.map(function(vw){
                        vw = beforeSave( vw );
                         return model.saveView(vw).then(function(saved){
                             /// the views should have been saved
                             /// so update with the items


                             return model.updateViewItems(vw);
                         });
                    });

                    q.all(vp)
                        .then(function( vList ){
                            console.log( "api.view.loadViews: loaded: "+JSON.stringify(vList) );
                            res.json( vList );
                        })
                        .catch(function( e ){
                            console.error("api.loadViews() -> " + e ) ;
                            return utils.sendError( res, e );
                        })
                });
            })
            .catch(function( e){
                console.error("api.loadViews() -> " + e ) ;
                return utils.sendError(res, (e));
            });
    };
//    console.log("viewApi:" + JSON.stringify(exports));
})(require("../model"), require("./utils.js"), require("q"), require("../typeSystem"));
