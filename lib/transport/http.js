/**
 * Created by denistrofimov on 27.01.16.
 */
var http = require('http');
var _ = require('lodash');
var Promise = require('bluebird');

/**
 * HTTP service
 * @param app
 * @param {Object} options
 * @param {String|Number} options.port
 * @param {String} [options.host]
 * @return {Promise|bluebird}
 */
module.exports = function (app, options) {

    return new Promise(function (resolve, reject) {
        // create server
        var server = http.createServer(app);

        // error handler
        server.on('error', function (error) {
            if (error.syscall !== 'listen')
                throw error;
            reject(error);
        });

        // Event listener for HTTP server "listening" event.
        server.on('listening', function () {
            var address = server.address();
            var bind = _.isString(address) ? address : address.port;
            console.info('\nHTTP service launched on ' + bind);
            resolve();
        });

        app.service = server;

        // Listen on provided port, on all network interfaces.
        server.listen(options.port, options.host);

    });

};
