/**
 * Created by denistrofimov on 27.01.16.
 */

var path = require('path');

/**
 * Core of system
 * @param {String} base application root directory
 * @param {Object} options
 * @param {Object} options.config
 * @param {Object} options.services
 * @param {Connection} options.mongo
 * @constructor
 */
function Core(base, options) {

    /**
     * Joins input with base
     * @param {String} input
     * @returns {String} joined path
     */
    this.base = function (input) {
        return path.join(base, input)
    };

    /**
     * Application configuration object
     * @type {Object}
     */
    this.config = options.config;

    /**
     * Application services
     * @type {Object}
     */
    this.services = options.services;

    /**
     * Mongoose connection
     * @type {Connection}
     */
    this.mongo = options.mongo;

    /**
     * Express app
     * @type {*}
     */
    this.app = null;

    /**
     * Return mongoose model by name
     * @param name
     * @returns {Model}
     */
    this.model = function (name) {
        return this.mongo.model(name);
    };

    /**
     * Return application service
     * @param name
     * @returns {*}
     */
    this.service = function (name) {
        return this.services[name];
    };

}

module.exports = Core;