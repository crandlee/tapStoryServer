

function wrap(functionToWrap, options) {

    var before = (options && options.before);
    var after = (options && options.after);
    var context = (options && options.context);
    var resultReplace = (options && options.result);

    return function() {
        var args = Array.prototype.slice.call(arguments), result;
        if (before && typeof before === 'function')
            before.apply(context || this, args);
        result = functionToWrap.apply(context || this, args);
        if (after && typeof after === 'function')
            after.apply(context || this, args);
        return resultReplace || result;
    }
}

module.exports = {
    wrap: wrap
};