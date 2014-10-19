S.Tree = (function () {

    function Tree (state, view) {
        this.alias = 'tree';
        this.nodes = {};
        S.Component.call(this, state, view);
    }

    Tree.prototype = Object.create(S.Component.prototype);
    Tree.prototype.constructor = Tree;

    Tree.Node = function (value, id, left, right) {
        this.value = value;
        this.id = id;
        this.left = left;
        this.right = right;
    };

    Tree.prototype.onSetState = function (state) {
        this.lastId = state.lastId || 0;
        var copiedTree = this.copy(state, null);
        copiedTree.lastId = this.lastId;
        this.computeHeights(copiedTree);
        return copiedTree;
    };

    Tree.prototype.onGetState = function (state) {
        return state;
    }

    Tree.prototype.root = function (next) {
        if (this._view)
            next(this.state);
        else
            return this.state;
    };
    Tree.prototype.root.live = true;

    Tree.prototype.add = function (parent, direction, value, next) {
        parent = this.getNodeById(parent);
        var added;
        if (direction) {
            if (parent.right) return;
            added = parent.right = new Tree.Node(value, this.getNextNodeId(), null, null);
        } else {
            if (parent.left) return;
            added = parent.left = new Tree.Node(value, this.getNextNodeId(), null, null);
        }
        this.setNodeById(added.id, added);
        this.computeHeights(this.state);
        if (this._view)
            this._view.add(parent, direction, value, function () {
                next(added);
            });
        else
            return added;
    };
    Tree.prototype.add.live = true;

    Tree.prototype.remove = function (node, next) {
        node = this.getNodeById(node);
        var parent = node.parent;
        if (node.parent && node.parent.left == node) {
            node.parent.left = null;
        } else if (node.parent && node.parent.right == node) {
            node.parent.right = null;
        }
        this.computeHeights(this.state);
        if (this._view)
            this._view.remove(node, next);
    }; 
    Tree.prototype.remove.live = true;

    Tree.prototype.set = function (node, value, next) {
        node = this.getNodeById(node);
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
        node = this.getNodeById(node);
        if (this._view)
            next(node.value);
        else
            return node.value;
    }; 
    Tree.prototype.get.live = true;

    Tree.prototype.height = function (next) {
        if (this._view)
            next(this.computeHeights(this._state));
        return this.computeHeights(this._state);
    }; 
    Tree.prototype.height.live = true;

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

    Tree.prototype.all = function (tree, fn) {
        if (tree) {
            fn(tree);
            this.all(tree.left, fn);
            this.all(tree.right, fn);
        }
    };

    Tree.prototype.copy = function (targetNode, parent) {
        if (!targetNode) return null;
        var node = new Tree.Node(targetNode.value, targetNode.id || this.getNextNodeId(), null, null);
        node.parent = parent;
        node.left = this.copy(targetNode.left, node);
        node.right = this.copy(targetNode.right, node);
        this.setNodeById(node.id, node);
        return node;
    };

    Tree.prototype.getNodeById = function (idOrObject) {
        var id = typeof idOrObject === 'string' ? idOrObject : idOrObject.id;
        return this.nodes[id];
    };

    Tree.prototype.setNodeById = function (id, node) {
        this.nodes[node.id] = node;
    };

    Tree.prototype.computeHeights = function (root) {
        if (root)
            return root.height = 1 + Math.max(this.computeHeights(root.left), this.computeHeights(root.right));
        return -1;
    };

    Tree.prototype.getNextNodeId = function () {
        var id = this.lastId;
        this.lastId++;
        if(this._state) this._state.lastId = this.lastId;
        return this.lastId;
    };

    return Tree;

})();
