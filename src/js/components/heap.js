S.Heap = (function () {

    function Heap (state, view) {
        // assuming state is a valid heap
        this.alias = 'heap';
        this.nodesByIndex = [];
        this.tree = new S.Tree(this.makeTree(state, null, 0), view ? view.treeView : null);
        this.array = new S.Array(state, view ? view.arrayView : null);
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
    };
    Heap.prototype.push.live = true;

    Heap.prototype.makeTree = function (array, parent, index) {
        if(index > array.length - 1)
            return null;
        // TODO don't pass in index for id, pass in id
        var node = new S.Tree.Node(array[index], index, null, null);
        node.left = this.makeTree(array, node, (index + 1) * 2 - 1);
        node.right = this.makeTree(array, node, (index + 1) * 2);
        node.parent = parent;
        this.nodesByIndex[index] = node;
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
        return this.nodesByIndex[index];
    };

    Heap.prototype.getLength = function (fn) {
        //this.array.getLength(fn);
        if(this.array.view)
            this.array.getLength(fn);
        else
            return this.array.getLength();
    };

    Heap.prototype.getLength.live = true;


    Heap.prototype.focus = function (index, next) {
        var oneFinished = false;
        this.tree.focus(this.getNodeByIndex(index), function () {
            if(oneFinished)
                next();
            else
                oneFinished = true;
        });
        this.array.focus(index, function() {
            if(oneFinished)
                next();
            else
                oneFinished = true;
        });
    };

    Heap.prototype.focus.live = true;


    return Heap;

})();
