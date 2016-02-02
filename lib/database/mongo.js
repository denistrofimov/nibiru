/**
 * Created by denistrofimov on 29.01.16.
 */

var util = require('util');
var mongoose = require('mongoose');
var Promise = require('bluebird');

module.exports = function (config) {

    var uri = util.format("mongodb://%s:%d/%s", config.mongo.host, config.mongo.port || 27017, config.mongo.database);

    console.info("\nSetup database connection");

    return new Promise(function (resolve, reject) {
        var connection = mongoose.createConnection(uri, {
            server: {
                poolSize: 5
            },
            user: config.mongo.user,
            pass: config.mongo.pass
        }).on('connecting', function () {
            console.info("\tConnecting to database on %s", uri);
        }).on('connected', function () {
            console.info("\tDatabase is connected");
        }).on('open', function () {
            resolve(connection);
            console.info("\tDatabase is opened");
        }).on('disconnecting', function () {
            console.info("\tDisconnecting from database on %s", uri);
        }).on('disconnected', function () {
            console.info("\tDatabase is disconnected");
        }).on('error', function (error) {
            reject(error);
            console.error('\t%s', error.message);
        });
    });
};