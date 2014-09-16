"use strict";
var cb = require('common-bundle')({test:true});
var should = cb.should;
var sinon = cb.sinon;

describe('controllers/coreCtrl.js', function() {

       var sandbox;
       var linkSvcStub, coreCtrl, resStub, next;


       beforeEach(function() {

           sandbox = sinon.sandbox.create();
           linkSvcStub = sandbox.stub(cb.rootRequire('svc-link'));
           coreCtrl = cb.proxyquire(cb.getRoutePathFromKey('ctrl-core'), { linkSvc: linkSvcStub });
           resStub  = sandbox.stub({
               send: function() {

               }
           });
           next = function() {};

       });

       describe('core', function() {

           it('requests appropriate hypermedia links from the link service', function() {

               coreCtrl.core(null, resStub, next);
               sinon.assert.calledOnce(linkSvcStub.attachLinksToObject);
               sinon.assert.calledWith(linkSvcStub.attachLinksToObject, sinon.match.object,
                sinon.match.array);

           });

           it('calls send on the resource with a 200 - OK when routed to', function() {

                var testLinks = { uri:"/test", rel: "test" };
                linkSvcStub.attachLinksToObject.returns(testLinks);
                coreCtrl.core(null, resStub, next);
                sinon.assert.calledOnce(resStub.send);
                sinon.assert.calledWithExactly(resStub.send, 200, testLinks);

           });
       });

       afterEach(function() {
           sandbox.restore();
       });
});