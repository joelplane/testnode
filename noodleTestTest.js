var test = require('./noodleTest')();
var EventEmitter = require('events').EventEmitter;
test.onFailureExitNonZero();

test.context("NoodleTest dogfood test", function() {

    this.it("should call the first context callback", function(done) {
        var t = require('./noodleTest')({quiet: true});
        t.context("test context", function() {
          done();
          this.it("test test", function(done2){
            done2();
          });
        });
    });

    this.it("should call the first test callback", function(done) {

        var t = require('./noodleTest')({quiet: true});
        t.context("test context", function() {
          this.it("test test", function(done2){
            done();
            done2();
          });
        });

    });

    this.it("should call the second context callback after the first", function(done) {
        var myThis = this;

        var firstCalled = false;
        var t = require('./noodleTest')({quiet: true});
        t.context("test context", function() {
          firstCalled = true;
          this.it("test1", function(done2){
            done2();
          });
        });
        t.context("test context", function() {
          myThis.assert(firstCalled);
          done();
          this.it("test1", function(done2){
            done2();
          });
        });

    });

    this.it("should keep Assertion in test's failed array if an assertion fails", function(done) {
        var myThis = this;

        var ee = new EventEmitter();

        var t = require('./noodleTest')({quiet: true});

        ee.on('setupDone', function(test){
          myThis.assert(test.failures.length > 0);
          myThis.assert(test.passes.length == 0);
          done();
        });

        t.context("test context", function() {
          this.it("test1", function(done2){
            this.assert(false);
            done2();
            ee.emit('setupDone', this);
          });
        });

    });

    this.it("should emit assertionFailed event when an assertion fails", function(done) {
        var myThis = this;

        var seenAssertionFailedEvent = false;
        var finish = function() {
          myThis.assert(seenAssertionFailedEvent);
          done();
        };

        var t = require('./noodleTest')({quiet: true});
        var timer = setTimeout(function(){
          finish();
        }, 200);
        t.on('assertionFailed', function() {
          seenAssertionFailedEvent = true;
          clearTimeout(timer);
          finish();
        });

        t.context("test context", function() {
          this.it("test1", function(done2){
            this.assert(false);
            done2();
          });
        });

    });

});