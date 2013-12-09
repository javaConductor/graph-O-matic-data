/**
 * Spacely Text & Binary Goods Inc.
 *
 * User: lcollins
 * Date: 11/28/13
 * Time: 1:08 AM
 *
 */

(function ( q, utils, model ) {

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

    /// promise(view)
    var loadInlineItem = function( view ){
        // each view item
        if (!view.data)
            return q(view);

        var pViewItems = view.data.items.map(function(vitem){
            return loadInlineViewItem(vitem);
        });
        return q.all(pViewItems).then(function(viewItems){
            view.data.items = viewItems;
            return view;
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
     * @param item
     *
     * @returns  (item)
     */
    var bindRelatedItemsToData = function(variables, item){
        if (item.data && item.data.length > 0){
            var nuData = item.data.reduce(function(acc, propertyData){
                // is this a variable reference ?
                if(propertyData["$VAR"]){
                    var varName = propertyData["$VAR"];
                    var varVal = variables[varName];
                    if(!varVal){
                        throw new Error("No such variable: "+varName);
                    }
                    acc.push( varVal );
                }else if( false && typeof propertyData === 'object' ) {
                //TODO: Implement this condition!!

                }else{
                    acc.push( propertyData );
                }
                return acc;
            }, []);
            console.log("api.viewLoad.bindRelatedItemsToData: "+JSON.stringify(nuData));
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
            criteria.typeName = relatedItemObj.typeName;
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

        return q.all(aRelItemsP)
            .then( function(aRelItems){
                /// maybe here is where we should check for missing items
                //aRelItems.filter(function(relItem){ return relItem })
                return aRelItems.reduce(function(acc, relItem){
                    return utils.extend(acc, relItem);
                },{});
            })
            .catch(function(e){
                console.error("api.view.loadRelatedItems: Could not load related items: " + e );
                throw new Error("api.view.loadRelatedItems: Could not load related items: " + e);
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
        if(view.data)
            view.data.items = view.data.items.map(function (viewItem) {
                viewItem.item = bindRelatedItemsToData(variables, viewItem.item);
                return viewItem;
            });
        return view;
    };

    exports.load = function(loadObject, transform){

        var theViews = loadObject.views || [];
        var vars = loadObject.variables || {};

        return loadRelatedItems(vars)
            .then(function(variables){
                theViews = theViews.map(function( vw ){
                    return bindRelatedItemsToView( variables, vw);
                });

                //// insert any inline items
                var ap=loadInlineItems(theViews);

                return q.all(ap).then( function(views){
                    console.log("api.loadViews():"+JSON.stringify(views));
                    // get an array of promises
                    var vp = views.map(function(vw){
                        if(transform)
                            vw = transform( vw );
                        return model.createView(vw.summary).then(function(saved){
                            /// the views should have been saved
                            /// so update with the items

                            return model.updateViewItems(vw);
                        });
                    });
                    return q.all(vp);
                });
            });
    };

//     = loadRelatedItems;
})(require("q"), require("../utils"),require("../model"));
