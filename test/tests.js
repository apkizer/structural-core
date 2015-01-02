QUnit.module('AsyncFunctionQueue');

/**
 * Test that AsyncFunctionQueue length is correct.
 */
QUnit.test('AsyncFunctionQueue_length', function (assert) {
    var asyncFunctionQueue = new S.AsyncFunctionQueue();
    for(var i = 0; i < 100; i++) {
        asyncFunctionQueue.push(function (fn) {
            fn();
        });
    }
    assert.equal(asyncFunctionQueue.functionList.length, 100, 'functionList.length should be 100');
});

/**
 * Test that function push onto the AsyncFunctionQueue correctly.
 */
QUnit.asyncTest('AsyncFunctionQueue_pushThree', function (assert) {
    expect(3);
    var asyncFunctionQueue = new S.AsyncFunctionQueue(),
        stringOne = 'hello',
        stringTwo = 'world',
        stringThree = 'foo';
    asyncFunctionQueue.push(function (fn) {
        stringOne = 'bye';
        fn();
    });
    asyncFunctionQueue.push(function (fn) {
        stringTwo = 'mars';
        fn();
    });
    asyncFunctionQueue.push(function (fn) {
        stringThree = 'bar';
        fn();
    });
    asyncFunctionQueue.push(function (fn) {
        assert.equal(stringOne, 'bye', 'stringOne should be bye');
        assert.equal(stringTwo, 'mars', 'stringTwo should be mars');
        assert.equal(stringThree, 'bar', 'stringThree should be bar');
        QUnit.start();
        fn();
    })
    asyncFunctionQueue.exec();
});

/**
 * Test that AsyncFunctionQueue executes next queued function.
 */
QUnit.asyncTest('AsyncFunctionQueue_next', function (assert) {
    expect(4);
    var asyncFunctionQueue = new S.AsyncFunctionQueue(),
        stringOne = 'barney'
        stringTwo = 'larry',
        stringThree = 'kim';
    asyncFunctionQueue.push(function (fn) {
        stringOne = 'red';
        fn();
    });
    asyncFunctionQueue.push(function (fn) {
        stringTwo = 'green';
        fn();
    });
    asyncFunctionQueue.push(function (fn) {
        stringThree = 'blue';
        fn();
    });
    asyncFunctionQueue.next(assertRed);
    function assertRed () {
        assert.equal(stringOne, 'red', 'stringOne should be red');
        asyncFunctionQueue.next(assertGreen);
    }
    function assertGreen () {
        assert.equal(stringTwo, 'green', 'stringTwo should be green');
        asyncFunctionQueue.next(assertBlue);
    }
    function assertBlue () {
        assert.equal(stringThree, 'blue', 'stringThree should be blue');
        asyncFunctionQueue.next(assertReachedEnd);
    }
    function assertReachedEnd (end) {
        assert.ok(end, 'end should be true');
        QUnit.start();
    }
});

/**
 * Test that the `completion` property on AsyncFunctionQueue is updated correctly.
 */
QUnit.asyncTest('AsyncFunctionQueue_completion', function (assert) {
    expect(2);
    var asyncFunctionQueue = new S.AsyncFunctionQueue();
    asyncFunctionQueue.push(function (fn) {
        fn();
    });
    asyncFunctionQueue.push(function (fn) {
        assert.equal(asyncFunctionQueue.completion, 0.25, 'completion should be 0.25');
        fn();
    });
    asyncFunctionQueue.push(function (fn) {
        fn();
    });
    asyncFunctionQueue.push(function (fn) {
        assert.equal(asyncFunctionQueue.completion, 0.75, 'completion should be 0.75');
        QUnit.start();
        fn();
    });
    asyncFunctionQueue.exec();
});

QUnit.module('Deferred');

QUnit.test('Deferred_include_asyncFunctionQueueDependence', function (assert) {
    // TODO
});

/**
 * Test that Deferred calls methods on the clone object right away.
 */
QUnit.test('Deferred_include_worksOnCopy', function (assert) {
    var deferred = new S.Deferred(new S.AsyncFunctionQueue());
    deferred.queue.open();
    function makeObject () {
        var ret = {
            propOne: 'lorem',
            propTwo: 'ipsum',
            foo: function (fn) {
                this.propOne = 'George';
            },
            bar: function (fn) {
                this.propTwo = 'Washington';
            }
        };
        ret.foo.live = true;
        ret.bar.live = true;
        return ret;
    }
    var original = makeObject(),
        clone = makeObject();
    deferred.include(original, clone, {
        name: 'myObject'
    });
    var myObjectDeferred = deferred.handle.myObject;
    myObjectDeferred.foo();
    assert.equal(clone.propOne, 'George', 'clone.propOne should have changed to George');
    assert.equal(clone.propTwo, 'ipsum', 'clone.propTwo should not have changed');
    myObjectDeferred.bar();
    assert.equal(clone.propOne, 'George', 'clone.propOne should still be George');
    assert.equal(clone.propTwo, 'Washington', 'clone.propTwo should have changed to Washington');
});

