/**
 * Created by denistrofimov on 27.01.16.
 */

var express = require('express');
var _ = require('lodash');

module.exports = function (core) {

    var utils = core.service('utils');
    var error = utils ? utils.error : function (code, message) {
        return new Error(message)
    };

    var config = core.config['api'] || {};

    var router = express.Router();

    var before = [];

    if (config.before && _.isFunction(config.before))
        before.push(config.before);

    return router

        .param("model", function (req, res, next, entity) {

            if (!~core.mongo.modelNames().indexOf(entity))
                return next(error(404, entity + " entity not found"));

            req.model = core.model(entity);

            return next();

        })

        .param("id", function (req, res, next, id) {

            req.model.findById(id)
                .then(function (instance) {
                    if (!instance)
                        throw error(404, req.model.name + " with id " + id + " not found");
                    req.instance = instance;
                    next();
                })
                .catch(next);

        })

        .get('/:model', before, function (req, res, next) {

            var page = req.query.page ? parseInt(req.query.page) - 1 : 0;
            var per_page = req.query.per_page ? parseInt(req.query.per_page) : (config['default_per_page'] || 50);
            var populate = req.query.populate;
            var query = req.query.query || {};
            var sort = req.query.sort;

            if (page < 0)
                page = 0;

            req.model.count(query).then(function (count) {

                return req.model.find(query)
                    .limit(per_page)
                    .skip(page * per_page)
                    .sort(sort)
                    .deepPopulate(populate).exec().then(function (instances) {
                        return {
                            result: instances,
                            meta: {
                                count: count,
                                page: page,
                                per_page: per_page
                            }
                        };
                    });
            }).then(res.send.bind(res)).catch(next);

        })

        .get('/:model/:id([0-9a-fA-F]{24})', before, function (req, res, next) {

            req.instance.deepPopulate(req.query.populate, function (err) {
                if (err)
                    return next(err);
                res.send(req.instance);
            });

        })

        .post('/:model', before, function (req, res, next) {

            req.model.create(req.body).then(res.send.bind(res)).catch(next);

        })

        .put('/:model/:id([0-9a-fA-F]{24})', before, function (req, res, next) {

            req.instance.set(req.body);

            return req.instance.save().then(res.send.bind(res)).catch(next);

        })

        .delete('/:model/:id([0-9a-fA-F]{24})', before, function (req, res, next) {

            req.instance.remove().then(res.send.bind(res)).catch(next);

        });
};
