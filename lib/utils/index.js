/**
 * Created by denistrofimov on 27.01.16.
 */

var fs = require('fs');
var path = require('path');

module.exports = {
    /**
     * Inspect file tree
     * @param {String} directory - start directory to inspect
     * @param {Array} [container] - array to fill
     * @returns {Array} - array of files
     */
    inspect: function (directory, container) {
        if (!fs.lstatSync(directory).isDirectory())
            return [];
        container = container || [];
        fs.readdirSync(directory).forEach(function (file) {
            file = path.join(directory, file);
            if (fs.lstatSync(file).isDirectory())
                return module.exports.inspect(file, container);
            container.push(file);
        });
        return container;
    }
};