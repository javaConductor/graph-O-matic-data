/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 7/8/13
 * Time: 8:42 PM
 */
(function (loader, optimist, fs, logger) {
	var argv = optimist.argv;

	logger.setLevel('DEBUG');
	logger.debug('Argv:'+JSON.stringify(argv));
	var le = [] 	;

	var done = function( ){
		le.forEach(function(loadedElement){
			console.log('Loaded -> %s -> %s -> %s -> %s', loadedElement.context,loadedElement.area, loadedElement.type, loadedElement.name );
		});
		process.exit(0);
	};

	var detail = function(loadedElement){
		console.log('Context:%s Area:%s Type:%s Name:%s', loadedElement.context,loadedElement.area, loadedElement.type, loadedElement.name );
		le.push(loadedElement);
	};

	if (argv.context && argv.area && argv.file ){
			loader.loadArea( argv.context, argv.area, argv.file, done , detail);
	}else if ( argv.path ){
			loader.loadContext(argv.context, argv.path, done , detail)
	}else{
		logger.error('Error in params:'+JSON.stringify(argv));
	}


    exports.loadDefaultContexts = function loadDefaultContexts(fDone, fDetail) {
        logger.debug("loader.loadDefaultContexts");
        loader.loadContext(null, 'contexts/default', fDone, fDetail);
    };

})(require("./contextLoader.js"), require('optimist'), require('fs'), require('../logger'));
