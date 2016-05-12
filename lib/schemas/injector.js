/**
 * Created by denistrofimov on 26.01.16.
 */

var mongoose = require('mongoose');
var populate = require('mongoose-deep-populate');
var relationship = require('mongoose-relationship');

var utils = require('../utils');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');

/**
 * Schema injector
 * @type {{inject: function}}
 */
module.exports = {
    /**
     * Inject schemas from [directory] to mongoose
     * @param {String} directory Root directory for injection
     * @param {Core} core application core
     * @returns {Promise|bluebird}
     */
    inject: function (directory, core) {

        console.info('\nInjecting schemas from %s\n', directory);

        // generate tasks for injecting
        var tasks = utils.inspect(directory).map(function (schema) {

            return function (cb) {

                // load schema loader
                var loader = require(schema);

                // getting scheme itself
                var scheme = loader(core);

                // install deep populate plugin
                scheme.plugin(populate);

                var relations = _.reduce(scheme.tree, function (relations, data, field) {
                    if (data.childPath || (_.isArray(data) && data.length && data[0].childPath))
                        relations.push(field);
                    return relations;
                }, []);

                // install relationship plugin
                if (relations.length)
                    scheme.plugin(relationship, {
                        relationshipPathName: relations
                    });

                var name = path.basename(schema, '.js');
                var underscored = scheme.options.collection || _.snakeCase(name);

                // load model to mongoose
                core.mongo.model(underscored, scheme);

                console.info('\tSchema "%s" has been injected as "%s" model', name, underscored);

                cb();
            }

        });

        return new Promise(function (resolve, reject) {

            // inject schemas in parallel
            async.parallel(tasks, function (err) {
                if (err)
                    return reject(err);

                return resolve();
            });
        });
    }
};