/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind */
console.log('adding bind() polyfill');
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

QUnit.test('vitals', function(assert) {
  assert.ok(typeof window.S == 'object', 'Structural is defined.');
});

QUnit.test('array.setItem', function(assert) {
  var array = window.S.components.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  function setAll() {
    for(var i = 0; i < this.getLength(); i++) {
      this.setItem(i, 0);
    }
  }
  array.def.close();
  setAll.call(array.deferredContext);
  assert.ok(array.deferredContext.getLength() === 10, 'length is ' + array.deferredContext.getLength());
  
  function checkAll() {
    for(var i = 0; i < this.getLength(); i++) {
      assert.ok(this.getItem(i) === 0, '0 is ' + this.getItem(i));
    }
  }
  
  checkAll.call(array.deferredContext);
});