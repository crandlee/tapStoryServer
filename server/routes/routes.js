var fileSystemUtility = require('../utilities/fileSystemUtility');
var assert = require('assert');

//Central Repository for more specific routes

function initialize(serverService, fileSystemService) {

    var dirRouteFileName = 'routes.js';
    console.log('Initializing routes');
    fileSystemUtility.getSubDirectories('./server/routes', function(err, directories) {
        assert.ifError(err);
        directories.forEach(function(dir) {
            var fileName = dir + '/' + dirRouteFileName;
            fileSystemService.getFileExistsAsync(fileName, function(exists) {
               if (exists) {
                    require(fileName.replace('./server/routes','./')
                        .replace('.js', ''))(serverService);
               }
            });
        });

    });


}


module.exports.initialize = initialize;