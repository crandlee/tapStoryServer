"use strict";

var resultsObj = {};

//Results Object is built

module.exports = function(category, module) {

    if (!category) throw new Error('Must provide a category name');
    if (!module) throw new Error('Must provide a module name');
    if (!resultsObj[category]) resultsObj[category] = {};
    if (!resultsObj[category][module]) resultsObj[category][module] = {};

    return {

        clearResults: function(method) {

            if (resultsObj[category] && resultsObj[category][module] && resultsObj[category][module][method])
                resultsObj[category][module][method] = null;

        },
        addResults: function(method, purpose, fn) {
            if (!method) throw new Error('Must provide a method name');
            if (!purpose) throw new Error('Must provide a purpose');
            if (!resultsObj[category][module][method]) resultsObj[category][module][method] = {};
            resultsObj[category][module][method][purpose] = fn;
        },
        getResults: function(method, purpose) {
            if (resultsObj[category] && resultsObj[category][module] &&
                resultsObj[category][module][method] && resultsObj[category][module][method][purpose])
                return resultsObj[category][module][method][purpose];
            this.clearResults(method);
            return null;
        },
        getAllResults: function() {
            if (resultsObj[category] && resultsObj[category][module])
                return resultsObj[category][module];
        }

    };
};