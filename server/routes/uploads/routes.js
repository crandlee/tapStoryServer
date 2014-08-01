"use strict";

var authCtrl = require('../../controllers/authentication/authCtrl');
var passport = require('passport');

module.exports = function(serverSvc) {


    serverSvc.addRoute('POST', '/upload',
        authCtrl.authenticateMethod(),
        function(req, res, next) {
            console.log(req.files);
            res.send(200, "Upload route is copacetic");
            return next();
        });


};