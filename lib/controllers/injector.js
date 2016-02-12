/**
 * Created by denistrofimov on 26.01.16.
 */

var fs = require('fs');
var path = require('path');
var utils = require('../utils/index');
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var express = require('express');

var _route = function (controller, relative) {
    if (_.isString(controller['$route']))
        return controller['$route'];

    var route;
    var name = path.basename(relative, '.js');
    if (name == 'index')
        route = path.dirname(relative);
    else
        route = relative.replace(/\.[^.$]+$/, '');

    return path.join('/', route);
};

module.exports = {
    /**
     * Inject controllers
     * @param {string} directory Root directory for injection
     * @param {Core} core application core
     * @returns {Promise|bluebird}
     */
    inject: function (directory, core) {

        directory = path.normalize(directory);

        console.info('\nMount controllers from %s\n', directory);

        var tasks = utils.inspect(directory).map(function (file) {

            return function (cb) {

                var loader = require(file);

                var controller = loader(core);

                var relative = path.relative(directory, file);
                var route = _route(controller, relative);
                var method = controller['$method'] || 'all';

                cb(null, {
                    method: method,
                    route: route,
                    handler: controller
                });

                console.info('\tController "%s" has been mounted on route "%s" for %s requests', path.basename(file, '.js'), route, method);
            }
        });

        return new Promise(function (resolve, reject) {
            async.parallel(tasks, function (err, controllers) {
                if (err)
                    return reject(err);

                var router = new express.Router();

                controllers.forEach(function (controller) {
                    router[controller.method.toLowerCase()](controller.route, controller.handler);
                });

                return resolve(router);
            });
        });
    }
};