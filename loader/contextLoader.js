/**
 * Created with JetBrains WebStorm.
 * User: lee
 * Date: 7/1/13
 * Time: 1:03 AM
 */
(function (findit, fs, path, model, async, logger) {

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
        var relTypes = contextObject.RelationshipTypes;
        var relCategories = contextObject.RelationshipCategories;
        var itemTypes = contextObject.ItemTypes;
        var itemCategories = contextObject.ItemCategories;

        var error = function (msg, err) {
            logger.error('%s %j', msg, err);
        };

        var typeNames = [];
        var fkResolutionFunctions = [];

        var createResolutionFunction = function createResolutionFunction(itemToUpdate, fieldName, nameMap, nameInMap, fSave) {
            return function (f) {
                logger.debug("createResolutionFunction(" + fieldName + " >> " + nameInMap + ")");
                if (!nameMap[nameInMap])
                    return f("Cannot resolve " + fieldName + ": " + nameInMap);
                if (!itemToUpdate[fieldName])
                    itemToUpdate[fieldName] = [];
                itemToUpdate[fieldName].push(nameMap[nameInMap]);

//				return itemToUpdate.save(f);
                return fSave(itemToUpdate, f);
            }
        }

        var createPropertyResolutionFunction = function createPropertyResolutionFunction(itemToUpdate, propertiesArray) {
            return function (f) {
                logger.debug("createPropertyResolutionFunction(" + JSON.stringify(propertiesArray) + ")");
                itemToUpdate.properties = itemToUpdate.properties || [];
                var newProps = [];
                async.map(propertiesArray,
                    function (properties, outerForEachCallback) {

                        async.parallel(
                            [function (paralellCallback) {
                                if (properties.itemType && properties.itemType.length) {

                                    var itemTypeList = [];
                                    async.map(properties.itemType,
                                        function (itemTypeName, cb) {
                                            var parts = itemTypeName.split(".");
                                            var ctxt, area, type;
                                            if (parts.length === 1) {
                                                ctxt = contextName;
                                                area = areaName;
                                                type = itemTypeName;
                                            } else if (parts.length === 3) {
                                                ctxt = parts[0];
                                                area = parts[1];
                                                type = parts[2];
                                            } else {
                                                //error
                                                logger.error("Bad type id:" + type);
                                                return f("Bad type id:" + type);
                                            }
                                            model.getItemType(ctxt, area, type, function (err, itemType) {
                                                if (err) {
                                                    error("Could not find type: " + ctxt + "." + area + "." + type, JSON.stringify(err));
                                                }
                                                if (!itemType) {
                                                    error("Could not find type: " + ctxt + "." + area + "." + type);
                                                }
                                                cb(err, itemType);
                                            });

                                        },
                                        function (err, itypes) {
                                            //itemToUpdate.properties = propertiesArray;
                                            properties.itemType = itypes;
                                            paralellCallback(null, properties);
                                        });
                                }
                                else
                                    paralellCallback();
                            }
                            ],
                            function (err) {
                                if (err) {
                                    logger.error("parallelCallback: err=" + JSON.stringify(err));
                                    outerForEachCallback(err);
                                    return f(err);
                                }
                                outerForEachCallback(null, properties);
                            }
                        );//parallel
                        //outerForEachCallback(null);
                    },
                    function (err, data) {
                        if (err) {
                            logger.error("forEachPropertyCallback: err=" + JSON.stringify(err));
                            return f(err);
                        }
                        logger.debug("forEachPropertyCallback: data=" + JSON.stringify(data));
                        itemToUpdate.properties = data;
                        model.updateItemType(itemToUpdate, f);
                    }
                );
            }; // returned function
        };

        var relTypeNameMap = {}, relCatNameMap = {}, itemTypeNameMap = {}, itemCatNameMap = {};
        /// Get name maps to resolve references
        //	model.nameMaps(function (err, relTypeNameMap, relCatNameMap,itemTypeNameMap, itemCatNameMap) {

        async.series([
            /// Relationship Categories ///
            /// Relationship Categories ///
            function (callback) {
                async.forEach(relCategories,
                    function (relCat, cb) {
                        relCat.origin = [];
                        relCat.origin.push({
                            context: contextName,
                            area: areaName
                        });

                        model.saveRelationshipCategory(relCat, function (err, cat) {
                            if (err) {
                                return cb(err, cat);
                            }
                            fDetail({context: contextName, area: areaName, type: 'RelationshipCategory', name: cat.name});

                            relCatNameMap[cat.name] = cat;
                            typeNames.push(cat.name);
                            cb(err, cat);
                        });
                    },
                    function (err) {
                        if (err)
                            logger.error("Error Loading " + contextName + '.' + areaName + " RelationshipCategories:" + JSON.stringify(err));
                        else
                            logger.debug("Done Loading " + contextName + '.' + areaName + " RelationshipCategories");
                        callback(err);
                    });
            },
            /// Item Categories ///
            /// Item Categories ///
            function (callback) {
                async.forEach(itemCategories,
                    function (itemCat, cb) {
                        itemCat.origin = [];
                        itemCat.origin.push({
                            context: contextName,
                            area: areaName
                        });
                        //var values = [];

                        model.saveItemCategory(itemCat, function (err, cat) {
                            if (err) {
                                return cb(err, cat);
                            }
                            fDetail({context: contextName, area: areaName, type: 'ItemCategory', name: cat.name});

                            itemCatNameMap[cat.name] = cat;
                            typeNames.push(cat.name);
                            //values.push(cat);
                            cb(err, cat);
                        });

                    },
                    function (err, values) {
                        if (err) {
                            logger.error("Error Loading " + contextName + '.' + areaName + " ItemCategories:" + JSON.stringify(err));
                            console.error("Error Loading " + contextName + '.' + areaName + " ItemCategories:" + JSON.stringify(err));

                        } else
                            logger.debug("Done Loading " + contextName + '.' + areaName + " ItemCategories");

                        if (err) {
                            logger.error("Exiting: " + JSON.stringify(err));
                            process.exit(-2);
                        } else
                            callback(null, values);
                    });
            },
            /// Relationship Type ///
            /// Relationship Type ///
            function (callback) {
                async.forEach(relTypes,
                    function (relType, cb) {
                        relType.origin = [];
                        relType.origin.push({
                            context: contextName,
                            area: areaName
                        });
                        if (relType.category)
                            relType.category = relCatNameMap[relType.name];
                        var tmpParent = relType.parent;
                        var tmpRecip = relType.reciprocalRelationship;
                        relType.parent = null;
                        relType.reciprocalRelationship = null;
                        model.saveRelationshipType(relType, function (err, saved) {
                            if (err) {
                                return cb(err, saved);
                            }
                            relTypeNameMap[saved.name] = saved;
                            fDetail({context: contextName, area: areaName, type: 'RelationshipType', name: saved.name})
                            typeNames.push(saved.name);
                            if (tmpParent) {
                                fkResolutionFunctions.push(createResolutionFunction(saved,
                                    "parent", relTypeNameMap, tmpParent,
                                    model.updateRelationshipType));
                            }
                            if (tmpRecip) {
                                fkResolutionFunctions.push(createResolutionFunction(saved,
                                    "reciprocalRelationship", relTypeNameMap, tmpRecip,
                                    model.updateRelationshipType));
                            }
                            cb(null, saved);
                        });
                    },
                    function (err) {
                        if (err) {
                            logger.error("Error Loading " + contextName + '.' + areaName + " RelationshipTypes:" + JSON.stringify(err));
                            console.error("Error Loading " + contextName + '.' + areaName + " RelationshipTypes:" + JSON.stringify(err));

                        } else
                            logger.debug("Done Loading " + contextName + '.' + areaName + " RelationshipTypes");

                        if (err) {
                            process.exit(-2);
                        }
                        callback(err);
                    });
            },
            function (callback) {
                var values = [];
                async.parallelLimit(fkResolutionFunctions, 1, function (err, data) {

                    if (err) {
                        logger.error("Error running resolution functions for " + contextName + '.' + areaName + ": " + JSON.stringify(err));
                        console.error("Error running resolution functions for " + contextName + '.' + areaName + ": " + JSON.stringify(err));

                    } else {
                        console.log("Done running resolution functions for " + contextName + '.' + areaName + ": " + JSON.stringify(data));
                        logger.debug("Done running resolution functions for " + contextName + '.' + areaName + ": " + JSON.stringify(data));
                    }
                    if (data)
                        values = values.concat(data);
                    logger.debug("ResolutionFunc: " + JSON.stringify(data));
                    //fkResolutionFunctions = [];
                    callback(err, values);
                });
                /// reset this array now that we are done w/ relTypes
            },
            /// Item Type ///
            /// Item Type ///
            function (callback) {
                async.forEach(itemTypes,
                    function (itemType, cb) {
                        itemType.origin = [];
                        itemType.origin.push({
                            context: contextName,
                            area: areaName
                        });

                        if (itemType.category) {
                            if (!itemCatNameMap[itemType.category]) {
                                console.error("Cannot resolve itemType:" + itemType.category);
                                logger.error("Cannot resolve itemType:" + itemType.category);
                            } else
                                itemType.category = itemCatNameMap[itemType.category];
                        }
                        else
                            itemType.category = null;

                        var tmpParent = itemType.parent;
                        itemType.parent = null;

                        var tmpProps = itemType.properties;
                        itemType.properties = null;

                        model.saveItemType(itemType, function (err, saved) {
                            if (err) {
                                return cb(err, saved);
                            }
                            itemTypeNameMap[saved.name] = saved;
                            fDetail({context: contextName, area: areaName, type: 'ItemType', name: saved.name});
                            typeNames.push(saved.name);
                            if (tmpParent) {
                                /// at this point we do not have all the parent itemTypes
                                /// Here we create a function that will get the parents when
                                /// the time is right
                                fkResolutionFunctions.push(createResolutionFunction(saved,
                                    "parent", itemTypeNameMap, tmpParent, model.updateItemType));
                            }
                            if (tmpProps) {
                                fkResolutionFunctions.push(createPropertyResolutionFunction(saved,
                                    tmpProps, model.updateItemType));
                            }
                            cb(null, saved);
                        });
                    },
                    function (err) {
                        if (err) {
                            logger.error("Error Loading " + contextName + '.' + areaName + " ItemTypes:" + JSON.stringify(err));
                            console.error("Error Loading " + contextName + '.' + areaName + " ItemTypes:" + JSON.stringify(err));

                        } else
                            logger.debug("Done Loading " + contextName + '.' + areaName + " ItemTypes");

                        if (err) {
                            process.exit(-2);
                        }
                        callback(err);
                    });
            },

            /// Item Type FK resolution ///
            /// Item Type FK resolution ///
            function (callback) {
                if (fkResolutionFunctions && fkResolutionFunctions.length > 0) {
                    async.parallelLimit(fkResolutionFunctions, 5, function (err, data) {
                        //if (err) logger.error("ResolutionFunc: Error:" + JSON.stringify(err));
                        //if (data) logger.debug("ResolutionFunc: Data:" + JSON.stringify(data));
                        /// reset this array now that we are done w/ itemTypes
                        fkResolutionFunctions = [];
                        callback(err, data);
                    })
                } else
                    callback(null, []);

            },

            /// Save the Context ///
            /// Save the Context ///
            function (callback) {
                model.saveContext(contextName, areaName, typeNames, function (err, saved) {
                    if (err) {
                        logger.error("Error saving Context:"
                            + contextName + "."
                            + areaName + ": "
                            + JSON.stringify(err));
                        callback(err);
                    } else {
                        logger.debug("Context loaded! ->", JSON.stringify(saved));
                        console.log("Context loaded! \ncontext ->", JSON.stringify(saved));
                        callback(null, saved);
                    }
                });
            },

            /// the Last Task ///
            /// the Last Task ///
            function (callback) {
                logger.debug(contextName + "." + areaName + " Done!");
                fDone(null, []);
                callback(null);
            }
        ]);

    };

    var checkForContextLoaded = function checkForContextLoaded(contextName, areaName, f) {
        model.getContext(contextName, areaName, function (err, ctxt) {
            var b = (ctxt) ? true : false;
            f(err, b);
        });
    };

    exports.loadArea = function loadArea(contextName, areaName, file, f, fDetail) {
        logger.debug("loader.loadArea");
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                logger.error('Error: ' + err);
                return;
            }
            data = JSON.parse(data);
            checkForContextLoaded(contextName, areaName, function (err, alreadyLoaded) {
                if (!alreadyLoaded)
                    exports.loadContextObject(contextName, areaName, data, f, fDetail);
                else {
                    logger.error("Area: " + contextName + "." + areaName + " is already loaded.");
                    console.log("Area: " + contextName + "." + areaName + " is already loaded.");
                }
            });
        });
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
                logger.debug("loader.loadContext: loading Area: " +  fobj.name + ' file:' + fobj.file);
                exports.loadArea(contextName, fobj.name, fobj.file, function (err, value) {
                    if (err)
                        return f(err);
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
            exports.loadContext(path.basename(dir), dir, f,fDetail);
        });
    }

})
    (require('findit'), require('fs'), require('path'), require('../model'), require('async'), require('../logger'));
