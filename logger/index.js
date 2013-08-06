/**
 * Spacely Text and Binary Goods Inc
 *
 * User: lee
 * Date: 8/4/13
 * Time: 2:16 AM
 */
(function (log4js) {
	log4js.configure('./log4js.json', { reloadSecs: 300 });
	module.exports = log4js.getLogger("graph-o-matic");
})(require("log4js"));
