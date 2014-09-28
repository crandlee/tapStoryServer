"use strict";

module.exports = {
    development: {
        rootPath: '',
        db: 'mongodb://localhost/tapStory',
        port: process.env.PORT || 3030,
        baseUri: '/api',
        uploadPath: '' + 'server/uploads/',
        allowedRemoteOrigins: ['http://localhost:3000'],
        protocol: 'http',
        hostname: 'localhost',
        applicationName: 'tapStoryServer',
        logName: 'tapStoryServer.log',
        usePortInHypermedia: true
    },
    production: {
        rootPath: '',
        db: 'mongodb://process:d1#$g6W349ld@ds055709.mongolab.com:55709/tapstory',
        port: process.env.PORT || 80,
        baseUri: '/api',
        protocol: 'http',
        hostname: 'tapstoryserver.herokuapp.com',
        uploadPath: '' + 'server/uploads/',
        allowedRemoteOrigins: [],
        applicationName: 'tapStoryServer',
        logName: 'tapStoryServer.log',
        usePortInHypermedia: false
    }
};
