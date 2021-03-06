/**
 * Created by denistrofimov on 27.01.16.
 */

var bootloader = require('./lib/bootloader');
var http = require('./lib/transport/http');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var util = require('util');

/**
 * Core
 * @param {String} base
 * @param {Object} [options]
 * @returns {Promise}
 */
module.exports = function (base, options) {
    return bootloader.load({
        base: base
    }).then(function (core) {

        if (options && !options.start)
            return core;

        return http(core.app, {
            port: core.config.server.port
        }).then(function () {
            return core;
        });
    });
};