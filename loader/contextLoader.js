/**
 * Spacely Text and Binary Goods Inc

 * User: lee
 * Date: 7/1/13
 * Time: 1:03 AM
 */
(function (findit, fs, path, model, wu, logger, q) {
//    console.dir("contextLoader: model=", (model));
    logger.setLevel("DEBUG");
    var suffix = ".ctxt.json";
    var endsWith = function (text, suffix) {
        return text.indexOf(suffix, text.length - suffix.length) !== -1;
    };

    exports.loadDefaultContexts = function loadDefaultContexts(fDone, fDetail) {
        logger.debug("loader.loadDefaultContexts");
        exports.loadContext(null, 'contexts/default', fDone, fDetail);
    };

    /**
     *
     * @param contextName
     * @param areaName
     * @param contextObject
     * @param fDone
     * @param fDetail
     * @returns {promise(Context)}
     */
    exports.loadContextObject = function loadContextObject(contextName, areaName, contextObject) {
        logger.debug("loader.loadContextObject");

        /// get the categories and types that make of this context or context area
        var relTypes = contextObject.RelationshipTypes || [];
        var categories = contextObject.Categories || [];
        var viewTypes = contextObject.ViewTypes || [];
        var itemTypes = contextObject.ItemTypes || [];

        var error = function (msg, err) {
            logger.error('%s %j', msg, err);
        };

        var typeNames = categories.concat(relTypes, itemTypes, viewTypes).map(function (t) {
            return contextName + "." + areaName + "." + t.name;
        });

        var writeKind = function (writeTypeFn, type) {
            type.origin = ({
                context: contextName,
                area: areaName
            });
            var p = writeTypeFn(type);
            return p.then(function (saved) {
                //fDetail({context: contextName, area: areaName, type: 'Category', name: type.name});
                return  (saved);
            });
        };

        var writeItemType = wu.curry(writeKind, model.saveItemType);
        var writeCategory = wu.curry(writeKind, model.saveCategory);
        var writeRelType = wu.curry(writeKind, model.saveRelationshipType);
        var writeViewType = wu.curry(writeKind, model.saveViewType);

        var pAll = function (list, writeFn) {
            var a = list.map(writeFn);
            return q.all(a);
        };

        var pAllItemTypes = pAll(itemTypes, writeItemType);
        var pAllRelationshipTypes = pAll(relTypes, writeRelType);
        var pAllCategories = pAll(categories, writeCategory);
        var pAllViewTypes = pAll(viewTypes, writeViewType);

        var d = q.defer();
        q.all([pAllCategories, pAllItemTypes, pAllRelationshipTypes, pAllViewTypes])
            .then(function (savedTypeLists) {
                logger.debug("Context loaded savedTypeLists ->", JSON.stringify(savedTypeLists));
              //  console.log("Context loaded savedTypeLists \ncontext ->", JSON.stringify(savedTypeLists));
                model.saveContext(contextName, areaName, typeNames)
                    .then(function(ctxt){
                        logger.debug("Context loaded! ->", JSON.stringify(ctxt));
                        //console.log("Context loaded! \ncontext ->", JSON.stringify(ctxt));
                        d.resolve(ctxt);
                    })
                   .catch(function(e){
                        d.reject("Error saving Context:"
                            + contextName + "."
                            + areaName + ": "
                            + JSON.stringify(e));
                        logger.error("Error saving Context:"
                            + contextName + "."
                            + areaName + ": "
                            + JSON.stringify(e));
                    });
                return savedTypeLists;
            })
            .catch(function (e) {
                d.reject("Error saving Types:"
                    + contextName + "."
                    + areaName + ": "
                    + JSON.stringify(e));
                logger.error("Error saving Types:"
                    + contextName + "."
                    + areaName + ": "
                    + JSON.stringify(e));
            });
    return d.promise;
    };

    /**
     *
     * @param contextName
     * @param areaName
     *
     * @returns promise( boolean ) true if the context loaded else false
     */
    var checkForContextLoaded = function checkForContextLoaded(contextName, areaName) {
        logger.debug("checkForContextLoaded", arguments);
        return model.getContext(contextName, areaName).then (function (ctxt) {
            return (ctxt) ? true : false;
        });
    };

    var doBoolPromise = function(p, trueFn, falseFn, errFn){
        //console.dir(["doBoolPromise: ", p.inspect()]);
        p.then(function(b){
            return (b ? trueFn : falseFn)();
        })
            .catch(function(e){
                logger.debug(["doBoolPromise: Promise failed:"+e+" ->",p.inspect()]);
                errFn(e);
            }).done(function(){
                logger.debug( [ "doBoolPromise: done()", p.inspect() ]);
            });
    };
    /**
     *
     * @param contextName
     * @param areaName
     * @param file
     * @param f
     * @param fDetail
     * @returns {promise}
     *  promise ->(Context)
     */
    exports.loadArea = function loadArea(contextName, areaName, file, f, fDetail) {
        var d = q.defer();
        logger.debug("loader.loadArea: Area: " + contextName + "." + areaName + ": " + fs.realpathSync(file));
        file = fs.realpathSync(file);
        if (!fs.existsSync(file)) {
            logger.error("Context Area File: [" + file + "](" + (file) + ") does not exist.");
            return f("File not found: " + file);
        };


        /**
         *
         * @param data
         * @returns {promise()}
         *  promise ->(Context)
         */
        var onAreaFile = function (data) {
            logger.debug("loader.loadArea: Area: read file: " + file);
            logger.debug("loader.loadArea: Area: not parsed: " + data);
            var d= q.defer();

            var p = checkForContextLoaded(contextName, areaName);
            p
                .then(function(isLoaded){
                    if(isLoaded){
                        logger.error("loader.loadArea: Area: " + contextName + "." + areaName + " is already loaded.");
  //                      console.log("loader.loadArea: Area: " + contextName + "." + areaName + " is already loaded.");
                        d.resolve({name:contextName, area:areaName});
                    }else
                    {
                        logger.debug("loader.loadArea: Area:  " + areaName + " not already loaded.");
                        data = JSON.parse(data);
                        logger.debug("loader.loadArea: Area: parsed: " + JSON.stringify(data));
                        return exports.loadContextObject(contextName, areaName, data)
                            .then(function(ctxt){
                                logger.debug("loader.loadArea: Area: " + contextName + "." + areaName + " is loaded.");
                                d.resolve(ctxt);
                            })
                            .catch(function(e){
                                logger.error("loader.loadArea: Area: " + contextName + "." + areaName + ": Error checking for context: "+e);
                                d.reject(e);
                            });
                    }
                })
                .catch(function(e){
                    logger.error("loader.loadArea: Area: " + contextName + "." + areaName + ": Error checking for context: "+e);
                    d.reject(e);
                })

            return d.promise;
        };

        try {
            var dd = fs.readFileSync(file, {encoding: 'utf8'});
            return onAreaFile(dd);
        }
        catch (e) {
            //TODO: FIX this !!
            d.promise.thenReject("Error reading file:" + file + ": " + e);
            logger.error("Error reading file:" + file + ": " + e);
            console.error("Error reading file:" + file + ": " + e);
            return d.promise;
        }
    };
    /**
     *
     * @param contextName
     * @param contextDirectory
     * @param f
     * @param fDetail
     * @returns promise(Array(Context))
     */
    exports.loadContext = function loadContext(contextName, contextDirectory, f, fDetail) {
        contextName = contextName || path.basename(contextDirectory);
        logger.debug("loader.loadContext(): " + contextName + "@" + contextDirectory);
        var d = q.defer();
        /// for each *.json.ctxt file in contextDirectory
        var finder = findit.find(contextDirectory);
        var flist = [];

        // gets hit with each file in dir
        /// we collect the file names in flist
        finder.on('file', function (file) {
            //logger.debug("loader.loadContext: found contextFile:" + (file));
            if (endsWith(file, suffix)) {
                var fname = path.basename(file);
                fname = fname.slice(0, fname.length - suffix.length);
                flist.push({name: fname, file: file});
            }
        });
        /**
         * Loads each file in the list of files
         *
         * @param contextName
         * @param list
         * @param values
         * @returns promise(Array(Context))
         */
        var loadFileList = function doList(contextName, list, values) {
            values = values || [];
            if (!list || list.length == 0) {
                logger.debug("loader.loadContext(): " + contextName + "@" + contextDirectory + " DONE!");
                return q.all(values);
            }
            var fobj = list[0];
            var pCtxt = exports.loadArea(  contextName, fobj.name, fobj.file );
            logger.debug("loader.loadContext: loading Area: " + fobj.name + ' file:' + fobj.file);
            //console.dir(["loader.loadContext: loadArea promise: " , pCtxt.inspect()]);
            return doList(contextName, list.slice(1), values.concat(pCtxt));
        };
        /// get hit when all the files in the dir have been found
        /// flist should have the file list now
        finder.on('end', function () {
            (loadFileList)(contextName, flist).then(function(values){
                logger.debug(["loader.loadContext.loadFileList", values]);
            });
           // logger.debug("loader.loadContext(): " + contextName + "@" + contextDirectory + " DONE!");
        });
    };


    /**
     * Given a contextRoot directory, loads each subDirectory as an Area and the
     * context is the contextRoot dir name.  Each Area is represented by a Context
     * object.
     *
     * @param contextRoot
     * @param fDetail
     *
     * @returns promise(Array(Context))
     */
    exports.loadContexts = function loadContexts(contextRoot, fDetail) {
        var d= q.defer();
        logger.debug("loader.loadContexts");
        var finder = findit.find(contextRoot);
        var ctxtList = [];
        //This listens for directories found
        finder.on('directory', function (dir) {
            logger.debug('Directory: ' + dir + '/');
            var ctxtP =  exports.loadContext(path.basename(dir), dir, fDetail);
            ctxtP
                .then(function(ctxt){
                    ctxtList.push(ctxt);
                })
        });
        finder.on('end',function(){
            d.resolve(ctxtList);
        });
        return d.promise;
    };
//    console.dir("contextLoader: END!");

})(require('findit'), require('fs'),
        require('path'), require('../model'),
        require('wu').wu, require('../logger'), require("q"));
