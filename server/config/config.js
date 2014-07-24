var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');

module.exports = {
    development: {
        rootPath: rootPath,
        db: 'mongodb://localhost/tapStory',
        port: process.env['PORT'] || 3030,
        baseUri: '/api'
    },
    production: {
        rootPath: rootPath,
        db: 'mongodb://localhost/tapStory',
        port: process.env['PORT'] || 80,
        baseUri: '/api'
    }
};
