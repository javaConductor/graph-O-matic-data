/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 7/8/13
 * Time: 8:42 PM
 */
(function (loader, optimist, fs) {
	var argv = optimist
	  .argv;
	console.log('Argv:'+JSON.stringify(argv));
	var le = [];
	var done = function( ){
		le.forEach(function(loadedElement){
			console.log('Loaded -> %s -> %s -> %s -> %s', loadedElement.context,loadedElement.area, loadedElement.type, loadedElement.name );
		});
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
		console.error('Error in params:'+JSON.stringify(argv));
	}

})(require("./loaderAsync.js"), require('optimist'), require('fs'));

