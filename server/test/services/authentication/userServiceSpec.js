var chai = require('chai');
var should = chai.should();
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('Services Tests', function () {
    describe('Authentication', function () {
        describe('userService.js', function() {
           var userSvc = require('../../../services/authentication/userService');

           describe('save', function() {

               it('should create a new user when none exists', function(done) {
                   userSvc.save({})
               });

               enc.saltAndHash(testSecret).should.be.fulfilled
                   .then(function(hash) {
                       should.exist(hash)
                   }).should.notify(done);
           });
        });
    });
});