/*
DEFERRED CONTEXT
----------------

- interfaces a set of components
- by default, always interfaces the standard component
- maintains ONE queue, which represents code executed against the context.
- can be ephemeral or long-lasting
- in app space, each component receives its own, personal context. 
- all composite methods and algorithms defined right before run time.
// - Since wrapping components is expensive, create DiferredContextFactory which returns a new queue NO WAY TO DO THIS
- wraps on instances of components

-- are deferred contexts cheap or permanent?
*/

// say we have these components:
// * standard component
// * an array
// * a tree
// and this traversal algorithm:

function traverseHeap(tree, array) {
    // ...
}

function doTraverseHeap() {
    traverseHeap.call(this, this.tree, this.array);
}

// these components could represent a min heap. Since many algos will probably be executed against these, we will create a factory:
var heapContextFactory = new S.DiferredContextFactory([std, array1, tree1]);
// now, whenever we wish to call algo:

doTraverseHeap.call(heapContextFactory.instance()); // doesn't re-wrap components, simply creates new queue.

// If components are volatile or cheap to wrap, we can create a diferredContext directly:

var heapContext = new S.DiferredContext([std, array1, tree1]);
doTraverseHeap.call(heapContext);

/*
app space
---------


- on-board diferredContext exists for on-board algos only

- compound methods defined pre-runtime, defined ON components.
*/


// wrappable:

{
	getSync: function(){},
	getAsync: function(){},
	getMethods: function(){}
}

