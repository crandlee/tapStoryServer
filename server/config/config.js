"use strict";
module.exports = {
    development: {
        rootPath: global.rootPath,
        db: 'mongodb://localhost/tapStory',
        port: process.env.PORT || 3030,
        baseUri: '/api',
        uploadPath: 'server/uploads/'
    },
    production: {
        rootPath: global.rootPath,
        db: 'mongodb://process:d1#$g6W349ld@ds055709.mongolab.com:55709/tapstory',
        port: process.env.PORT || 80,
        baseUri: '/api',
        uploadPath: 'server/uploads/'
    }
};
