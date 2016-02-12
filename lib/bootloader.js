/**
 * Created by denistrofimov on 27.01.16.
 */

var path = require('path');
var ConfigInjector = require('./config/injector');
var ServiceInjector = require('./services/injector');
var ControllersInjector = require('./controllers/injector');
var SchemaInjector = require('./schemas/injector');
var Core = require('./core');
var mongo = require('./database/mongo');

/**
 * Bootloader
 * @type {{load: module.exports.load}}
 */
module.exports = {
    /**
     * Load core components, models, controllers
     * @param {Object} options
     * @param {String} options.base application components base directory (app root)
     * @return {Promise}
     */
    load: function (options) {

        var base = path.normalize(options.base);

        // inject configuration
        return ConfigInjector.inject(path.join(base, 'config'), base).then(function (config) {

            return mongo(config).then(function (connection) {

                // inject services
                return ServiceInjector.inject(path.join(options.base, 'services'), config).then(function (services) {

                    var core = new Core(base, {
                        config: config,
                        services: services,
                        mongo: connection
                    });

                    var loader = require(path.join(options.base, 'app.js'));

                    var app = loader(core);

                    core.app = app;

                    // inject database models
                    return SchemaInjector.inject(path.join(options.base, 'models'), core).then(function () {

                        // inject routers
                        return ControllersInjector.inject(path.join(options.base, 'controllers'), core).then(function (router) {

                            // install controllers router
                            app.use('/', router);

                        });
                    }).then(function () {
                        console.info('\nBootloading has been completed');
                        return core;
                    });
                });

            });

        });
    }
};