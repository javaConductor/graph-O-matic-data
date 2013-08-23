/**
 * Created with JetBrains WebStorm.
 * User: lcollins
 * Date: 8/22/13
 * Time: 12:39 AM
 * To change this template use File | Settings | File Templates.
 */

(function(model){

    exports.sendError = function(res, msg){
                res.send({errorMessage:msg});
        }

})( require("../model") );

