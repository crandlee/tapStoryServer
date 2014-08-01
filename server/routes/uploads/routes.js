"use strict";

var authCtrl = require('../../controllers/authentication/authCtrl');
var passport = require('passport');


module.exports = function(serverSvc) {


    serverSvc.addRoute('POST', '/upload',
        authCtrl.authenticateMethod(),
        function(req, res, next) {

            res.send(200);
            return next();
        });

    serverSvc.addRoute('GET', '/upload',
        authCtrl.authenticateMethod(),
        function(req, res, next) {
            res.end('<html><head></head><body>' +
                '<form method="POST" enctype="multipart/form-data">' +
                '<input type="text" name="textField"><br/>' +
                '<input type="file" name="fileField"><br/>' +
                '<input type="file" name="fileField2"><br/>' +
                '<input type="submit">' +
                '</form>' +
                '</body></html>');
            return next();
        });
};