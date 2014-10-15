S.Tree = (function () {

    function Tree(state, view) {
        this.alias = 'tree';
        this.nodes = {};
        this.lastId = state.lastId || 0;
        var copy = this.copyTree(state, null);
        copy.lastId = this.lastId;
        S.Component.call(this, copy, view); // TODO handleState should be called
        this.height = this.computeHeights(this.state);
    }

    Tree.TreeNode = function (value, sid, left, right) {
        this.value = value;
        this.sid = sid;
        this._left = left;
        this._right = right;
    };

    Tree.prototype = Object.create(S.Component.prototype);
    Tree.prototype.constructor = Tree;


    Tree.prototype.handleState = function (state) {
        //
    };

    Tree.prototype.prepareState = function (state) {
        //state.lastId = this.lastId;
    }

    Tree.prototype.root = function (next) {
        console.dir(this);
        if (this._view)
            next(this.state);
        else
            return this.state;
    };
    Tree.prototype.root.live = true;

    Tree.prototype.add = function (parent, direction, value, next) {
        console.info('Adding node...');
        console.dir(parent);
        parent = this.getNode(parent);
        console.dir(parent);
        var added;
        if (direction) {
            if (parent.right) return; // a node is already there
            added = parent.right = new Tree.TreeNode(value, this.nextId(), null, null);
        } else {
            if (parent.left) return; // a node is already there
            added = parent.left = new Tree.TreeNode(value, this.nextId(), null, null);
        }
        console.log('Calling setNode');
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
        var n = new Tree.TreeNode(_node.value, _node.sid || this.nextId(), null, null);
        n.parent = parent;
        n.left = this.copyTree(_node.left || _node._left, n); // TODO get rid of ||
        n.right = this.copyTree(_node.right || _node._right, n); // TODO get rid of ||
        this.setNode(n);
        return n;
    };

    Tree.prototype.getNode = function (sidOrObject) {
        console.log('getNode, nodes is');
        console.dir(this.nodes);
        var sid = typeof sidOrObject === 'string' ? sidOrObject : sidOrObject.sid;
        return this.nodes[sid];
        /*if (typeof sidOrObject === 'string')
            return this.nodes[sidOrObject];
        else
            return this.nodes[sidOrObject.sid];*/
    };

    Tree.prototype.setNode = function (treeNode) {
        console.info('Setting node %s', treeNode.sid);
        this.nodes[treeNode.sid] = treeNode;
    };

    Tree.prototype.computeHeights = function (root) {
        if (root)
            return root.height = 1 + Math.max(this.computeHeights(root.left), this.computeHeights(root.right));
        return -1;
    };

    Tree.prototype.nextId = function () {
        var id = this.lastId;
        this.lastId++;
        if(this.state) this.state.lastId = this.lastId;
        return 'sid' + this.lastId;
    }

    return Tree;

})();
