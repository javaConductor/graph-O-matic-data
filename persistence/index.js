/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 7/5/13
 * Time: 12:59 AM
 */
(function (config) {
	/// Code goes here

	var pa = require( config.persistenceAdapter );

	for (var name in pa)
	{
		exports[ name ] = pa[ name ];
	}

})(require('../config.js').config);
