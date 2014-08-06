QUnit.test('vitals', function(assert) {
  assert.ok(typeof window.S == 'object', 'Structural is defined.');
});

QUnit.test('array.setItem', function(assert) {
  var array = S.components.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
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
  //
  checkAll.call(array.deferredContext);
});