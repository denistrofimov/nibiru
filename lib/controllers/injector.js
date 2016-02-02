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

var _handler = function (controller) {
    return function (req, res, next) {
        var method = req.params['method'];
        if (!_.isFunction(controller[method]))
            return next();
        controller[method].apply(controller, [req, res, next]);
    }
};

var _route = function (controller, relative) {
    if (_.isString(controller['@route']))
        return controller['@route'];

    var route;
    var name = path.basename(relative, '.js');
    if (name == 'index')
        route = path.dirname(relative);
    else
        route = relative.replace(/\.[^.$]+$/, '');

    return path.join('/', route, ':method');
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
                if (!_.isObject(controller))
                    return cb(new Error('Controller "' + path.basename(file, '.js') + '" must be an object'));

                var relative = path.relative(directory, file);
                var route = _route(controller, relative);
                var method = (controller['@method'] || 'all').toLowerCase();

                cb(null, {
                    route: route,
                    method: method,
                    handler: _handler(controller)
                });

                console.info('\tController "%s" has been mounted on route "%s" for %s requests', path.basename(file, '.js'), route, method);
            }
        });

        return new Promise(function (resolve, reject) {
            async.parallel(tasks, function (err, controllers) {
                if (err)
                    return reject(err);

                var route = new express.Router();

                controllers.forEach(function (controller) {
                    route[controller.method](controller.route, controller.handler);
                });

                return resolve(route);
            });
        });
    }
};