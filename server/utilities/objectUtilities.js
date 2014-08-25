'use strict';
require('require-enhanced')();

function mergeObjectFromArray(obj, argNames, argsArray) {

    if (argNames && Array.isArray(argNames)) {
        argNames.forEach(function(name, index) {
           if (argsArray.length > index) obj[name] = argsArray[index];
        });
    }
    return obj;

}

module.exports = {
    arr2Obj: mergeObjectFromArray
};