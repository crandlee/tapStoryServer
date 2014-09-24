"use strict";
var cb = require('common-bundle')({test:true});
var should = cb.should;
var sinon = cb.sinon;

describe('controllers/coreCtrl.js', function() {

       var sandbox;
       var coreCtrl, resStub, next;


       beforeEach(function() {

           sandbox = sinon.sandbox.create();
           coreCtrl = cb.proxyquire(cb.getRoutePathFromKey('ctrl-core'), { });
           resStub  = sandbox.stub({
               send: function() {

               }
           });
           next = function() {};

       });

       describe('core', function() {

           it('calls send on the resource with a 200 - OK when routed to', function() {

                var testLinks = { uri:"/test", rel: "test" };
                coreCtrl.core(null, resStub, next);
                sinon.assert.calledOnce(resStub.send);
                sinon.assert.calledWithExactly(resStub.send, 200, testLinks);

           });
       });

       afterEach(function() {
           sandbox.restore();
       });
});