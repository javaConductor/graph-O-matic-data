/**
 * Spacely Text and Binary Goods Inc

 * User: lee
 * Date: 7/1/13
 * Time: 1:03 AM
 */
(function (findit, fs, path, model, async, logger) {
console.dir("contextLoader: model=",model);
    logger.setLevel("DEBUG");
    var suffix = ".ctxt.json";
    var endsWith = function (text, suffix) {
        return text.indexOf(suffix, text.length - suffix.length) !== -1;
    };

    exports.loadDefaultContexts = function loadDefaultContexts(fDone, fDetail) {
        logger.debug("loader.loadDefaultContexts");
        exports.loadContext(null, 'contexts/default', fDone, fDetail);
    };

    exports.loadContextObject = function loadContextObject(contextName, areaName, contextObject, fDone, fDetail) {
        logger.debug("loader.loadContextObject");

        /// get the categories and types that make of this context or context area
        var relTypes = contextObject.RelationshipTypes || [];
        var categories = contextObject.Categories || [];
        var viewTypes = contextObject.ViewTypes || [];
        var itemTypes = contextObject.ItemTypes || [];

        var error = function (msg, err) {
            logger.error('%s %j', msg, err);
        };

        var typeNames = [];
        var relTypeNameMap = {};
        var writeItemType = function (itemType, cb) {
            itemType.origin=({
                context: contextName,
                area: areaName
            });

            model.saveItemType(itemType, function (err, saved) {
                if (err) {
                    return cb(err, saved);
                }
                fDetail({context: contextName, area: areaName, type: 'ItemType', name: saved.name});
                typeNames.push(saved.name);
                cb(null, saved);
            });};
        var writeCategory = function (cat, cb) {
            cat.origin =({
                context: contextName,
                area: areaName
            });

            model.saveCategory(cat, function (err, cat) {
                if (err) {
                    return cb(err, cat);
                }
                fDetail({context: contextName, area: areaName, type: 'Category', name: cat.name});
                typeNames.push(cat.name);
                cb(err, cat);
            });
        };
        var writeViewType = function (viewType, cb) {
            viewType.origin =({
                context: contextName,
                area: areaName
            });
            //var values = [];

            model.saveViewType(viewType, function (err, vtype) {
                if (err) {
                    return cb(err, null);
                }
                fDetail({context: contextName, area: areaName, type: 'Viewtype', name: vtype.name});
                typeNames.push(vtype.name);
                cb(err, vtype);
            });
        };
        var writeRelationshipType = function (relType, cb) {
            relType.origin = ({
                context: contextName,
                area: areaName
            });
            relType.reciprocalRelationship = null;
            model.saveRelationshipType(relType, function (err, saved) {
                if (err) {
                    return cb(err, saved);
                }
                relTypeNameMap[saved.name] = saved;
                fDetail({context: contextName, area: areaName, type: 'RelationshipType', name: saved.name})
                typeNames.push(saved.name);
                cb(null, saved);
            });
        };

        for( var i in categories){
            writeCategory(categories[i], function(e,d){
            } );
        }
        for( var i in relTypes){
            writeRelationshipType(relTypes[i], function(e,d){
            } );
        }
        for( var i in itemTypes){
            writeItemType(itemTypes[i], function(e,d){
            } );
        }

        for( var i in viewTypes){
            writeViewType(viewTypes[i], function(e,d){
            } );
        }

        model.saveContext(contextName, areaName, typeNames, function (err, saved) {
            if (err) {
                logger.error("Error saving Context:"
                    + contextName + "."
                    + areaName + ": "
                    + JSON.stringify(err));
                //callback(err);
            } else {
                logger.debug("Context loaded! ->", JSON.stringify(saved));
                console.log("Context loaded! \ncontext ->", JSON.stringify(saved));
                //callback(null, saved);
                //fDone("Done!")
                fDone({context: contextName, area: areaName, type: 'Context'});
            }
        });

    };

    var checkForContextLoaded = function checkForContextLoaded(contextName, areaName, f) {
        logger.debug("checkForContextLoaded", arguments);
        model.getContext(contextName, areaName, function (err, ctxt) {
            var b = (ctxt) ? true : false;
            f(err, b);
        });
    };

    exports.loadArea = function loadArea(contextName, areaName, file, f, fDetail) {
        logger.debug("loader.loadArea: Area: " + contextName + "." + areaName + ": " + fs.realpathSync(file));
        file = fs.realpathSync(file);
        if (!fs.existsSync(file)) {
            logger.error("Context Area File: [" + file + "](" + (file) + ") does not exist.");
            return f("File not found: " + file);
        };

        var onAreaFile = function (data) {
            logger.debug("loader.loadArea: Area: read file: " + file);
            logger.debug("loader.loadArea: Area: not parsed: " + data);
            data = JSON.parse(data);
            logger.debug("loader.loadArea: Area: parsed: " + JSON.stringify(data));
            checkForContextLoaded(contextName, areaName, function (err, alreadyLoaded) {
                if (!alreadyLoaded) {
                    logger.debug("loader.loadArea: Area:  " + areaName + " not already loaded.");
                    exports.loadContextObject(contextName, areaName, data, f, fDetail);
                } else {
                    logger.error("loader.loadArea: Area: " + contextName + "." + areaName + " is already loaded.");
                    console.log("loader.loadArea: Area: " + contextName + "." + areaName + " is already loaded.");
                    f("loader.loadArea: Area: " + contextName + "." + areaName + " is already loaded.");
                }
            });
        };

        try {
            var dd = fs.readFileSync(file, {encoding: 'utf8'});
            onAreaFile(dd);
        }
        catch (e) {
            return logger.error("Error reading file:" + file + ": " + e);
        }
    };

    exports.loadContext = function loadContext(contextName, contextDirectory, f, fDetail) {
        contextName = contextName || path.basename(contextDirectory);
        logger.debug("loader.loadContext(): " + contextName + "@" + contextDirectory);

        /// for each *.json.ctxt file in contextDirectory
        var finder = findit.find(contextDirectory);
        var flist = [];

        finder.on('file', function (file) {
            //logger.debug("loader.loadContext: found contextFile:" + (file));
            if (endsWith(file, suffix)) {
                var fname = path.basename(file);
                fname = fname.slice(0, fname.length - suffix.length);
                flist.push({name: fname, file: file});
            }
        });

        finder.on('end', function () {
            (function doList(contextName, list, f, values) {
                values = values || [];
                if (!list || list.length == 0) {
                    logger.debug("loader.loadContext(): " + contextName + "@" + contextDirectory + " DONE!");
                    return f(null, values);
                }
                var fobj = list[0];
                logger.debug("loader.loadContext: loading Area: " + fobj.name + ' file:' + fobj.file);
                exports.loadArea(contextName, fobj.name, fobj.file, function (err, value) {
                    if (err) {
                        logger.debug("loader.loadContext: error loading Area: " + fobj.name + ' file:' + fobj.file + ": " + err);
                        return doList(contextName, list.slice(1), f, values);
//                        return f(err);
                    }
                    return doList(contextName, list.slice(1), f, values.concat(value));
                }, fDetail);
            })(contextName, flist, f);
            logger.debug("loader.loadContext(): " + contextName + "@" + contextDirectory + " DONE!");
        });

    };

    exports.loadContexts = function loadContexts(contextRoot, f, fDetail) {
        logger.debug("loader.loadContexts");
        var finder = findit.find(contextRoot);
        //This listens for directories found
        finder.on('directory', function (dir) {
            logger.debug('Directory: ' + dir + '/');
            exports.loadContext(path.basename(dir), dir, f, fDetail);
        });
    }
})(require('findit'), require('fs'),
        require('path'), require('../model'),
        require('async'), require('../logger'));
