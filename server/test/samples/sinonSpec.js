var sinon = require('sinon');
var chai = require('chai');
var should = chai.should();

var testSvc =
{
    callCallback: function (cb) {
        cb();
    },
    callCallbackWithReturnValue: function (cb) {
        return cb();
    },
    callDependency: function() {
        return myDep.someMethod();
    },
    callDependencyBetter: function(dep) {
        return dep.someMethod();
    }


};

var myDep = {
  someMethod: function() {
      return 10;
  }
};

function realCallback() {
    return 4;
}

describe('Sinon Samples', function () {


    describe('Spies', function () {

        it('should spy on a callback', function () {

            var spy = sinon.spy();
            testSvc.callCallback(spy);
            spy.called.should.equal(true);
        });

        it('should call a real implementation if given a real function to spy on', function () {

            var spy = sinon.spy(realCallback);
            var returnValue  = testSvc.callCallbackWithReturnValue(spy);
            spy.called.should.equal(true);
            returnValue.should.equal(4);

        });

        it('should spy on a method of an object', function () {

            var spy = sinon.spy(myDep, 'someMethod');
            var returnValue  = testSvc.callDependencyBetter(myDep);
            spy.called.should.equal(true);
            returnValue.should.equal(10);

        });

        //Some spy/call options - called, calledOnce, calledTwice, calledThrice
        //-- firstCall, secondCall, thirdCall, lastCall
        //-- calledBefore(spy)
        //-- calledAfter(spy)
        //-- calledOn(obj), alwaysCalledOn(obj)
        //-- calledWith(args...)
        //-- alwaysCalledWith(args...)
        //-- calledWithExactly(args...)
        //-- alwaysCalledWithExactly(args...)
        //-- notCalledWith(args...)
        //-- neverCalledWith(args...)
        //-- calledWithMatch(args...)
        //-- alwaysCalledWithMatch(args...)
        //-- notCalledWithMatch(args...)
        //-- neverCalledWithMatch(args...)
        //-- calledWithNew
        //-- threw, threw("string"), throw(obj)
        //-- alwaysThrew, alwaysThrew("string"), alwaysThrew(obj)
        //-- returned(obj), alwaysReturned(obj)
        //-- getCall(n), thisValues
        //-- args, exceptions, returnValues
        //-- reset, printf


    });

    describe("Sinon specific assertions", function() {

        it("should use a built-in assert", function() {
           //Generic message
           var spy = sinon.spy();
           // ---** spy.called.should.equal(true);
        });
        it("should use a sinon assert", function() {
            //Better error message
            var spy = sinon.spy();
            // ---*** sinon.assert.called(spy);
            //Also notCalled, calledOnce, etc...
            //callCount(spy, num)
            //callOrder(spy1, spy2,...)
            //many others
        });
    });


    var Combat = function() {

    };
    Combat.prototype.attack = function(attacker, defender) {
        if(attacker.calculateHit(defender)) {
            defender.takeDamage(attacker.damage);
        }
    };
    var Character = function() {};
    Character.prototype.calculateHit = function() {

    };
    Character.prototype.takeDamage = function () {

    };


    describe("Stubs", function() {


       //Stubs are like spies that change the behavior of the
       //underlying objects
        describe("combat attack", function() {
           it('should damage the defender if the hit is successful', function() {
              var combat = new Combat();
              var defender = sinon.stub(new Character());
              var attacker = sinon.stub(new Character());
              attacker.damage = 5;
              attacker.calculateHit.returns(true);
              combat.attack(attacker, defender);
              defender.takeDamage.getCall(0).calledWith(5).should.equal(true);

           });
        });

    });

    describe("Mocks", function() {
        //Mocks are like stubs except assertions are stated before instead
        //of after

        it("should damage the defender if the hit is successful - mock", function() {
            var combat = new Combat();
            var defender = new Character();
            var mockDefender = sinon.mock(defender);
            var expectation = mockDefender.expects("takeDamage")
                .once().withArgs(5);
            var attacker = sinon.stub(new Character());
            attacker.damage = 5;
            attacker.calculateHit.returns(true);
            combat.attack(attacker, defender);
            expectation.verify();


        });
    });

});