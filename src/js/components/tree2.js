(function(){

  function Tree(state, view) {
    S.Component.call(this, state, view);
  }

  Tree.prototype = Object.create(S.Component.prototype);
  Tree.prototype.live = {};

  Object.defineProperty(Tree.prototype, 'state', {
    get: function() {
      return this._state;
    },
    set: function(tree) {
      this._state = copyTree(tree, null);
      this.height = computeHeights(this._state);
    }
  });

  /**
   * Returns the root of the tree.
   * @returns {*}
   */
  Tree.prototype.live.root = function() {
    return this.state;
  }
  Tree.prototype.live.root.getter = true;

  /**
   * Returns the height of the tree.
   * @returns {*}
   */
  Tree.prototype.live.height = function() {
    this.height = computeHeights();
    return this.height;
  }
  Tree.prototype.live.height.getter = true;

  /**
   * Adds a node to the tree.
   * @param parent The parent to add the node onto.
   * @param direction The direction to add the node (false for left, true for right).
   * @param value The value of the new node.
   * @returns {*} The added node.
   */
  Tree.prototype.live.add = function(parent, direction, value) {
    var added;
    if(direction) {
      added = parent.right = node(value);
    } else {
      added = parent.left = node(value);
    }
    this.height = computeHeights(c.tree);
    return bindGetters(added);
  }

  /**
   * Removes the given node from the tree and all of its children.
   * @param node The node to remove.
   */
  Tree.prototype.live.remove = function(node) {
    if(node.parent && node.parent.left == node) {
      node.parent.left = null;
    } else if(node.parent && node.parent.right == node) {
      node.parent.right = null;
    } else {

    }
    this.height = computeHeights(this.state);
  }

  /**
   * Sets the value of the given node.
   * @param node
   * @param value
   */
  Tree.prototype.live.setNode = function(node, value) {
    node.value = value; 
  }

  /**
   * Sets the [direction] child of `parent` to `child`.
   * @param parent
   * @param direction false for left, true for right
   * @param child
   */
  Tree.prototype.live.setChild = function(parent, direction, child) {
    // TODO
  }

  /*
  View only methods
   */
  Tree.prototype.live.mark = null;

  Tree.prototype.live.markPath = null;

  Tree.prototype.live.clearPath = null;

  Tree.prototype.live.showHeights = null;

  Tree.prototype.live.hideHeights = null;

  Tree.prototype.live.height = null;

  Tree.prototype.live.clearlabels = null;

  Tree.prototype.live.clearfocus = null;

  Tree.prototype.live.travel = null;

  Tree.prototype.live.label = null;

  Tree.prototype.live.focusOn = null;

  // utils:

  function bindGetters(node) {
    return node;
  }

  function computeHeights(root) {
    if(root)
      return root.height = 1 + Math.max(computeHeights(root.left), computeHeights(root.right));
    return -1;
  }

  function computeParents(root) {

  }

  function node(value) {
    return {
      value: value,
      left: null,
      right: null,
      sid: S.nextId()
    };
  }

  function copyTree(_node, parent) {
    // this should use either left or _left to lookup child references
    if(!_node) return null;
    var n = node(_node.value);
    n.parent = parent;
    n.left = copyTree(_node.left || node._left, n);
    n.right = copyTree(_node.right || node._right, n);
    return n;
  }

  S.defineComponent2('tree2', Tree);
})();