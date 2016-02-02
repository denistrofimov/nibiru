/**
 * Created by denistrofimov on 27.01.16.
 */

var fs = require('fs');
var path = require('path');
var utils = require('../utils');
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');

module.exports = {
    /**
     *
     * @param {string} directory Root directory for injection
     * @param {object} config
     * @returns {Promise|bluebird}
     */
    inject: function (directory, config) {

        directory = path.normalize(directory);

        console.info('\nInjecting services from %s\n', directory);

        var tasks = utils.inspect(directory).filter(function (file) {
            return _.endsWith(path.basename(file, '.js').toLowerCase(), 'service')
        }).map(function (file) {
            return function (cb) {

                var loader = require(file);

                var service = loader(config);

                var name = path.relative(directory, file).toLowerCase()
                    .replace(/\.[^.$]+$/, '')
                    .replace('service', '')
                    .replace('/', '.');

                cb(null, {
                    name: name,
                    service: service
                });

                console.info('\tService "%s" has been injected as %s', path.basename(file, '.js'), name);
            }
        });

        return new Promise(function (resolve, reject) {
            async.parallel(tasks, function (err, services) {
                if (err)
                    return reject(err);

                return resolve(_.reduce(services, function (memo, service) {
                    memo[service.name] = service.service;
                    return memo;
                }, {}));
            });
        });
    }
};