"use strict";
var cb = require('common-bundle')({test:true});
var should = cb.should;
var sinon = cb.sinon;
var testUtils = cb.testUtils;


describe('services/authentication/userServiceOptions', function() {

    var sandbox;
    var authorizeSvc, encryptionSvc, userServiceOptions;
    cb.errSvc.bypassLogger(true);


    beforeEach(function() {

        sandbox = sinon.sandbox.create();
        authorizeSvc = sandbox.stub(cb.rootRequire('svc-auth'));
        encryptionSvc = sandbox.stub(cb.rootRequire('util-encryption'));
        userServiceOptions =
            cb.proxyquire(cb.getRoutePathFromKey('svc-opts-user'),
                { authorizeSvc: authorizeSvc, encryptionSvc: encryptionSvc});

    });


    function testOptionsSetting(fn, opts) {

        opts = cb.extend({}, opts);
        fn(opts);
        should.exist(opts.preValidation);
        opts.preValidation.should.be.a('function');
        opts.modelName.should.equal('User');
        should.exist(opts.singleSearch);
        should.exist(opts.mapOptionsToDocument);
        opts.mapOptionsToDocument.should.be.a('function');

        return opts;
    }

    describe('saveUserOptions', function() {

        it('adds the proper fields to the options object', function() {
            var opts = testOptionsSetting(userServiceOptions.setSaveUserOptions);
            opts.onNew.roles.should.equal('user');
        });
    });

    describe('saveFileOptions', function() {
        it('adds the proper fields to the options object', function() {
            //This should take care of the setRemoveFileOptions case since
            //they are aliasing the same function
            var opts = testOptionsSetting(userServiceOptions.setAddFileOptions);
            opts.updateOnly.should.equal(true);
        });
    });

    describe('setAddRoleOptions', function() {
        it('adds the proper fields to the options object', function() {

            var role = testUtils.getRandomString(10);
            var opts = { role: role };
            opts = testOptionsSetting(userServiceOptions.setAddRoleOptions, opts);
            opts.role.should.equal(role.toLowerCase());

        });
    });

    describe('setRemoveRoleOptions', function() {
        it('adds the proper fields to the options object', function() {

            var role = testUtils.getRandomString(10);
            var opts = { role: role };
            opts = testOptionsSetting(userServiceOptions.setRemoveRoleOptions, opts);
            opts.role.should.equal(role.toLowerCase());

        });
    });

    afterEach(function() {

       sandbox.restore();

    });
});
