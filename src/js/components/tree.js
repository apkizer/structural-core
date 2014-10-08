S.Tree = (function () {
    function Tree(state, view) {
        this.alias = 'tree';
        this.nodes = {};
        var copy = this.copyTree(state, null);
        S.Component.call(this, copy, view); // TODO handleState should be called
        this.height = this.computeHeights(this.state);
        //this.component = this;
    }

    Tree.TreeNode = function (value, sid, left, right) {
        this.value = value;
        this.sid = sid;
        this._left = left;
        this._right = right;
    };

    Tree.prototype = Object.create(S.Component.prototype);
    Tree.prototype.constructor = Tree;
    //Tree.prototype.live = {};

    Tree.prototype.handleState = function (state) {
        return this.copyTree(state, null);
    };

    Tree.prototype.root = function (next) {
        console.dir(this);
        if (this._view)
            next(this.state);
        else {
            console.info('Operating in synchronous mode');
            console.dir(this._view);
            return this.state;
        }
    };
    Tree.prototype.root.live = true;

    Tree.prototype.add = function (parent, direction, value, next) {
        parent = this.getNode(parent);
        var added;
        if (direction) {
            if (parent.right) return; // a node is already there
            added = parent.right = new Tree.TreeNode(value, S.nextId(), null, null);
        } else {
            if (parent.left) return; // a node is already there
            added = parent.left = new Tree.TreeNode(value, S.nextId(), null, null);
        }
        this.setNode(added);
        this.height = this.computeHeights(this.state);
        if (this._view)
            this._view.add(parent, direction, value, function () {
                next(added);
            });
        else
            return added;
    };
    Tree.prototype.add.live = true;

    Tree.prototype.remove = function (node, next) {
        node = this.getNode(node);
        var parent = node.parent;
        if (node.parent && node.parent.left == node) {
            node.parent.left = null;
        } else if (node.parent && node.parent.right == node) {
            node.parent.right = null;
        } else if (node.parent) {
            // problem
        } else {
            // must have been root node
        }
        this.height = this.computeHeights(this.state);
        if (this._view)
            this._view.remove(node, next);
    };
    Tree.prototype.remove.live = true;

    Tree.prototype.set = function (node, value, next) {
        node = this.getNode(node);
        node.value = value;
        if (this._view)
            this._view.set(node, value, function () {
                next(node);
            });
        else
            return node;
    };
    Tree.prototype.set.live = true;

    Tree.prototype.get = function (node, next) {
        node = this.getNode(node);
        if (this._view)
            next(node.value);
        else
            return node.value;
    };
    Tree.prototype.get.live = true;

    Tree.prototype.height = function (next) {
        if (this._view)
            next(this.height);
        return this.height;
    };
    Tree.prototype.height.live = true;

    /* View only methods */

    Tree.prototype.mark = function (next) {
        if (this._view) this._view.mark(next);
    };
    Tree.prototype.mark.live = true;

    Tree.prototype.markPath = function (next) {
        if (this._view) this._view.markPath(next);
    };
    Tree.prototype.markPath.live = true;

    Tree.prototype.clearPath = function (next) {
        if (this._view) this._view.clearPath(next);
    };
    Tree.prototype.clearPath.live = true;

    // TODO delete
    /*Tree.prototype.showHeights = function(next) {
     if(this._view) this._view.showHeights(next);
     };

     // TODO delete
     Tree.prototype.hideHeights = function(next) {
     if(this._view) this._view.hideHeights(next);
     };*/

    Tree.prototype.clearLabels = function (next) {
        if (this._view) this._view.clearLabels(next);
    };
    Tree.prototype.clearLabels.live = true;

    Tree.prototype.travel = function (parent, direction, next) {
        if (this._view) this._view.travel(parent, direction, next);
    };
    Tree.prototype.travel.live = true;

    Tree.prototype.label = function (node, label, next) {
        if (this._view) this._view.label(node, label, next);
    };
    Tree.prototype.label.live = true;

    Tree.prototype.focus = function (node, next) {
        if (this._view) this._view.focus(node, next);
    };
    Tree.prototype.focus.live = true;

    Tree.prototype.unfocus = function (node, next) {
        if (this._view) this._view.unfocus(node, next);
    };
    Tree.prototype.unfocus.live = true;

    Tree.prototype.clearFocus = function (node, next) {
        if (this._view) this._view.clearFocus(node, next);
    };
    Tree.prototype.clearFocus.live = true;

    Tree.prototype.display = function (options, next) {
        if (this._view) this._view.display(options, next);
    };
    Tree.prototype.display.live = true;

    // utils:
    Tree.prototype.allNodes = function (tree, fn) {
        if (tree) {
            fn(tree);
            this.allNodes(tree.left, fn);
            this.allNodes(tree.right, fn);
        }
    };

    Tree.prototype.copyTree = function (_node, parent) {
        if (!_node) return null;
        console.log('copying ' + _node.value);
        var n = new Tree.TreeNode(_node.value, _node.sid || S.nextId(), null, null);
        /*if (_node.sid)
         n.sid = _node.sid;
         else
         n.sid = S.nextId();*/
        n.parent = parent;
        n.left = this.copyTree(_node.left || _node._left, n); // TODO get rid of ||
        n.right = this.copyTree(_node.right || _node._right, n); // TODO get rid of ||
        /*if (n.sid == 'sid_0') {
         console.log('ROOT');
         console.dir(n);
         }*/
        //this.nodes[n.sid] = n;
        this.setNode(n);
        return n;
    };

    /*Tree.prototype._makeTreeNodes = function (root) {
     var treeNode = null;
     if (root) {
     treeNode = new Tree.TreeNode(root.sid, this._makeTreeNodes(root.left), this._makeTreeNodes(root.right));
     this.nodes[treeNode.sid] = treeNode;
     }
     return treeNode;
     };*/

    Tree.prototype.getNode = function (sidOrObject) {
        if (typeof sidOrObject === 'string')
            return this.nodes[sidOrObject];
        else
            return this.nodes[sidOrObject.sid];
    };

    Tree.prototype.setNode = function (treeNode) {
        this.nodes[treeNode.sid] = treeNode;
    };

    Tree.prototype.computeHeights = function (root) {
        if (root)
            return root.height = 1 + Math.max(this.computeHeights(root.left), this.computeHeights(root.right));
        return -1;
    };


    /*function node(value) {
     return {
     value: value,
     left: null,
     right: null
     };
     }*/

    return Tree;
})();