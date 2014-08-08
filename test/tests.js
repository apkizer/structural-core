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

QUnit.test('array.live.setItem', function(assert) {
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

QUnit.test('tree.live.isBinary', function(assert) {
  var node = function(value) {
    return {
      value: value,
      left: null,
      right: null
    }
  },
      root = node(20);
  
  root.left = node(14);
  root.right = node(25);
  root.left.left = node(6);
  root.left.right = node(16);
  root.right.left = node(23);
  root.right.right = node(26);
  
  var tree = S.components.tree(root);
  
  assert.ok(tree.deferredContext.isBinary(), 'tree is bst');
  
  tree.deferredContext.root().value = 0;
  
  assert.ok(!tree.deferredContext.isBinary(), 'tree is not bst');
  
  root = node(5);
  root.left = node(5);
  root.right = node(5);
  root.left.left = node(5);
  root.left.right = node(5);
  root.right.left = node(5);
  root.right.right = node(5);
  
  tree = S.components.tree(root);
  
  assert.ok(tree.deferredContext.isBinary(), 'equivalence tree is bst');
});

