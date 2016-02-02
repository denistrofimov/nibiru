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
 * @returns {Promise}
 */
module.exports = function (base) {
    return bootloader.load({
        base: base
    }).then(function (core) {

        // catch 404 and forward to error handler
        core.app.use(function (req, res, next) {
            next(core.service('utils').error(404, 'Не найдено'));
        });

        // error handlers
        core.app.use(function (err, req, res, next) {
            var message = err.message || "Internal server error";
            var status = err.status || 500;
            res.status(status);
            res.send({
                code: status,
                message: message,
                url: req.url
            });
            console.error(err);
        });

        return http(core.app, {
            port: core.config.server.port
        }).then(function () {
            return core;
        });
    });
};