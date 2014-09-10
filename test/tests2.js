QUnit.test('deferred/AsyncFunctionQueue', function(assert) {
  var queue = new S.AsyncFunctionQueue();

  function fn0(fn) {
    assert(true, 'fn0 called');
    fn();
  }

  function fn1(fn) {
    assert(true, 'fn1 called');
    fn();
  }

  queue.push(fn0);
  queue.push(fn1);

})