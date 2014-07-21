var mongoose = require('mongoose');

function initialize(config) {

    console.log('Initializing database ' + config.db);

    mongoose.connect(config.db);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDb Connection Error'));
    db.once('open', function () {
        console.log('MongoDb Connection Opened');
    });

    //TODO-Randy: Add default data
}
module.exports.initialize = initialize;


