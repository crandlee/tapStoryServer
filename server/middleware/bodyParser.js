"use strict";

var multer = require('multer');

module.exports = multer({
    dest: 'server/uploads',
    rename: function(fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase();
    }
});