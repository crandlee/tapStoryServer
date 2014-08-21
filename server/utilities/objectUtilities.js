'use strict';
require('require-enhanced')();

function mergeObjectFromArguments(obj, argNames, args, startPosition, endPosition) {

    var realArgs = Array.prototype.slice.call(args, startPosition, endPosition);
    if (argNames && Array.isArray(argNames)) {
        argNames.forEach(function(name, index) {
           if (realArgs.length > index) obj[name] = realArgs[index];
        });
    }
    return obj;

}

module.exports = {
    args2Obj: mergeObjectFromArguments
};