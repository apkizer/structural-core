S.Heap = (function () {

    function Heap (state, view) {
        // assuming state is a valid heap
        this.alias = 'heap';
        this.tree = new S.Tree(this.makeTree(state, null, 0), view.treeView);
        this.array = new S.Array(state, view.arrayView);
        S.Component.call(this, state, view);
    }

    Heap.prototype = Object.create(S.Component.prototype);
    Heap.prototype.constructor = Heap;

    Heap.prototype.push = function (value, next) {
        var oneFinished = false;
        this.array.push(value, function () {
            if(oneFinished)
                next();
            else
                oneFinished = true;
        });
        var index = this.array.state.length - 1;
        this.tree.add(this.getNodeByIndex(this.getParentIndex(index)), 
            getAvailableDirection(index), value, function () {
                if(oneFinished)
                    next();
                else
                    oneFinished = true;
            });
    }
    Heap.prototype.push.live = true;

    Heap.prototype.makeTree = function (array, parent, index) {
        if(index > array.length - 1)
            return null;
        // TODO don't pass in index for id, pass in id
        var node = new S.Tree.Node(array[index], index, null, null);
        node.left = this.makeTree(array, node, (index + 1) * 2 - 1);
        node.right = this.makeTree(array, node, (index + 1) * 2);
        node.parent = parent;
        return node;
    };

    Heap.prototype.getParentIndex = function (index) {
        return Math.floor((index + 1) / 2) - 1;
    }

    Heap.prototype.getAvailableDirection = function (index) {
        if(index % 2 == 0) 
            return true;
        return false;
    };

    Heap.prototype.getNodeByIndex = function (index) {

    };



    return Heap;

})();
