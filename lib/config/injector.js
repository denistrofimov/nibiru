/**
 * Created by denistrofimov on 27.01.16.
 */

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Promise = require('bluebird');

/**
 *
 * @param file config file
 * @param root application root
 * @returns {Promise|bluebird}
 */
var loadConfig = function loadConfig(file, root) {
    return new Promise(function (resolve, reject) {

        var defaultConfig = require(file);

        if (!_.isFunction(defaultConfig))
            return reject(new Error('Config file "' + file + '" must export a function'));

        var config = defaultConfig(root);

        if (!_.isObject(config))
            return reject(new Error('Export function in config file "' + file + '" must return an object'));

        resolve(config);
    });
};

module.exports = {
    /**
     * Inject configuration
     * @param {string} directory config directory
     * @param {string} root application root directory
     * @returns {Promise|bluebird}
     */
    inject: function (directory, root) {

        directory = path.normalize(directory);

        var file = path.join(directory, 'config.js');

        console.info('Injecting default configuration from %s', file);

        return loadConfig(file, root).then(function (config) {

            var mode = process.env['mode'];

            if (!mode)
                return config;

            var modeFile = path.join(directory, mode, 'config.js');

            console.info('Extending configuration with "%s" from %s', mode, modeFile);

            return loadConfig(modeFile, root).then(function (modeConfig) {
                return _.extend(config, modeConfig);
            });

        });
    }
};