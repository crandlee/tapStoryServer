var mongoose = require('mongoose');
var encryptionUtility = require('../../utilities/encryptionUtility');
var authorizeSvc = require('../../services/authorization/authorizationService');

//User schema
var userSchema = mongoose.Schema({
    firstName: {type:String, required:'{PATH} is required!'},
    lastName: {type:String, required:'{PATH} is required!'},
    userName: {
        type:String,
        required:'{PATH} is required!',
        unique: true
    },
    userSecret: {type:String, required:'{PATH} is required!'},
    roles: [String]
});

//Instance methods
userSchema.methods = {
    authenticate: function (passwordToMatch) {
        return encryptionUtility.checkEqualToken(passwordToMatch, this.userSecret);
    },
    hasRole: function(role) {
        return (this.roles.indexOf(role) > -1) && (authorizeSvc.isValidRole(role));
    },
    viewModel: function(type) {
        switch (type){
            default:
                return {
                    id: this.id,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    userName: this.userName,
                    roles: this.roles
                }
        }

    }
};

//Static Methods
// --NONE--
//Virtual Getters
// --NONE--


//Create model
var User = mongoose.model('User', userSchema);

//Initial data
exports.createDefaultUsers = function () {

    User.find({}).exec(function (err, collection) {
        if (collection.length === 0) {
//            var salt, hash;
//            salt = encryption.createSalt();
//            hash = encryption.hashPwd(salt, 'randy');
//            User.create({ firstName: 'Randy', lastName: 'Lee', userName: 'randy@gmail.com', salt: salt, hashed_pwd: hash, roles: ['admin'] });
//            salt = encryption.createSalt();
//            hash = encryption.hashPwd(salt, 'melissa');
//            User.create({ firstName: 'Melissa', lastName: 'Lee', userName: 'melissa@gmail.com', salt: salt, hashed_pwd: hash, roles: []});
//            salt = encryption.createSalt();
//            hash = encryption.hashPwd(salt, 'owen');
//            User.create({ firstName: 'Owen', lastName: 'Mathews', userName: 'owen@gmail.com', salt: salt, hashed_pwd: hash});
        }
    });

};
