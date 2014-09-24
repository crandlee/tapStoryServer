"use strict";
var cb = require('common-bundle')();
var _ = cb._;
var ctrlHelper = cb.rootRequire('ctrl-helper');

function validateBody(bodyParams, req, res, next) {

    if (!_.isPlainObject(req.body)) return next();

    var removeInvalidBodyParams = function(bodyParams, body) {
        var tempBody = _.clone(body);
        _.each(_.partial(_.without,_.keys(body)).apply(null,_.map(bodyParams, function(param) {
            return _.isString(param) ? param : param.name;
        })), function(invalidParam) {
            delete tempBody[invalidParam];
        });
        return tempBody;
    };

    bodyParams = bodyParams || [];
    var reqObj = _.reduce(bodyParams, function(currentValidationResult, param) {
        var failedRequired = function(param, body) {
            return ((!body) || !body[param]);
        };
        if ((_.isString(param) || (_.isPlainObject(param) && param.required)) && failedRequired(param, req.body)) {
            currentValidationResult[(_.isString(param) ? param : param.name) + '/required'] = 'failed';
        }
        return currentValidationResult;
    }, {});

    req.body = removeInvalidBodyParams(bodyParams, req.body);

    if (!_.isEmpty(reqObj))
        ctrlHelper.setBadRequest(res, next, reqObj);
    else
        return next();
}


module.exports = {
    validateBody: validateBody
};
