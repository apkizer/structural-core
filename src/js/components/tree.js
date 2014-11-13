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
        var returnState = {};
        returnState.nextId = state.nextId || 0;
        returnState.root = this.copyTree(state.root, null);
        this.setNodeIds(returnState.root, returnState);
        this.computeHeights(returnState.root);
        return returnState;
    };

    Tree.prototype.onGetState = function (state) {
        return state;
    };

    Tree.prototype.root = function (next) {
        if (this.view)
            next(this.state.root);
        else
            return this.state.root;
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
        this.nodes[added.id] = added;
        this.computeHeights(this.state);
        if (this.view)
            this.view.add(parent, direction, value, function () {
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
        if (this.view)
            this.view.remove(node, next);
    }; 
    Tree.prototype.remove.live = true;

    Tree.prototype.set = function (node, value, next) {
        node = this.getNodeById(node);
        node.value = value;
        if (this.view)
            this.view.set(node, value, function () {
                next(node);
            });
        else
            return node;
    }; 
    Tree.prototype.set.live = true;

    Tree.prototype.get = function (node, next) {
        node = this.getNodeById(node);
        if (this.view)
            next(node.value);
        else
            return node.value;
    }; 
    Tree.prototype.get.live = true;

    Tree.prototype.height = function (next) {
        if (this.view)
            next(this.computeHeights(this._state));
        return this.computeHeights(this._state);
    }; 
    Tree.prototype.height.live = true;

    Tree.prototype.mark = function (next) {
        if (this.view) this.view.mark(next);
    }; 
    Tree.prototype.mark.live = true;

    Tree.prototype.markPath = function (next) {
        if (this.view) this.view.markPath(next);
    }; 
    Tree.prototype.markPath.live = true;

    Tree.prototype.clearPath = function (next) {
        if (this.view) this.view.clearPath(next);
    }; 
    Tree.prototype.clearPath.live = true;

    Tree.prototype.clearLabels = function (next) {
        if (this.view) this.view.clearLabels(next);
    };
    Tree.prototype.clearLabels.live = true;

    Tree.prototype.travel = function (parent, direction, next) {
        console.log('Travelling!');
        if (this.view) this.view.travel(parent, direction, next);
    };
    Tree.prototype.travel.live = true;

    Tree.prototype.label = function (node, label, next) {
        if (this.view) this.view.label(node, label, next);
    };
    Tree.prototype.label.live = true;

    Tree.prototype.focus = function (node, next) {
        if (this.view) this.view.focus(node, next);
    };
    Tree.prototype.focus.live = true;

    Tree.prototype.unfocus = function (node, next) {
        if (this.view) this.view.unfocus(node, next);
    };
    Tree.prototype.unfocus.live = true;

    Tree.prototype.clearFocus = function (node, next) {
        if (this.view) this.view.clearFocus(node, next);
    };
    Tree.prototype.clearFocus.live = true;

    Tree.prototype.display = function (options, next) {
        if (this.view) this.view.display(options, next);
    };
    Tree.prototype.display.live = true;

    Tree.prototype.allNodes = function (tree, fn) {
        if (tree) {
            fn(tree);
            this.allNodes(tree.left, fn);
            this.allNodes(tree.right, fn);
        }
    };

    Tree.prototype.copyTree = function (targetNode, parent) {
        var node = null;
        if(targetNode) {
            node = new Tree.Node(targetNode.value, targetNode.id, null, null);
            node.parent = parent;
            node.left = this.copyTree(targetNode.left, node);
            node.right = this.copyTree(targetNode.right, node);
            this.nodes[node.id] = node;
        }
        return node;
    };

    Tree.prototype.getNodeById = function (idOrObject) {
        var id = typeof idOrObject === 'object' ? idOrObject.id : idOrObject;
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

    Tree.prototype.setNodeIds = function (root, state) {
        if(root) {
            if(typeof root.id === 'undefined')
                root.id = this.getNextNodeId(state);
            this.setNodeIds(root.left, state);
            this.setNodeIds(root.right, state);
        }
    }

    Tree.prototype.getNextNodeId = function (state) {
        return state.nextId++;
    };

    return Tree;

})();
