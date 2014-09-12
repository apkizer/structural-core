(function(){

  /*
  NOTE:
  Components should not accept objects as parameters. If they do, they should only use and id property set on object, because
  doing operations on the actual object passed in will not work, because it references an object in the synchronous phase.
  Basically, pretend component is a webserver receiving requests. It cannot maintain a map of external objects, etc.
  Example violation:

  var obj = {};
  component.setObj('myObj', obj);
  var gotten = component.getObj('myObj');
  obj === gotten // NOT guaranteed
   */

  function Tree(state, view) {
    // this.live.component = this; // no need, this bound in deferred
    this.alias = 'tree';
    this.nodeMap = {};
    var s = this._copyTree(state, null);
    console.log('Tree setting view');
    console.dir(view);
    S.Component.call(this, s, view);
  }

  Tree.prototype = Object.create(S.Component.prototype);
  Tree.prototype.constructor = Tree;
  Tree.prototype.live = {};

  // TODO delete
  // Tree.prototype.noCopy = true;

  /*Tree.prototype.setState = function(state) {
    this.state = state;
    this.height = computeHeights(this.state);
  }*/

  Object.defineProperty(Tree.prototype, 'state', {
    get: function() {
      return this._state;
    },
    set: function(state) {
      this._state = state;
      this.height = computeHeights(this.state);
    }
  });

  Tree.prototype.getState = function() {
    return this.state;
  }

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
    this.height = computeHeights(this.state);
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
    console.log('Adding %s', value);
    parent = this.nodeMap[parent.sid];
    var added;
    if(direction) {
      added = parent.right = node(value);
    } else {
      added = parent.left = node(value);
    }
    added.sid = S.nextId();
    this.nodeMap[added.sid] = added;
    console.dir(added);
    console.log('parent it');
    console.dir(parent);
    this.height = computeHeights(this.state);
    return bindGetters(added);
  }

  /**
   * Removes the given node from the tree and all of its children.
   * @param node The node to remove.
   */
  Tree.prototype.live.remove = function(node) {
    console.info('Removing node ' + node.sid);

    node = this.nodeMap[node.sid];
    var parent = this.nodeMap[node.parent.sid];

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
    node = this.nodeMap[node.sid];
    node.value = value;
    return node;
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

  Tree.prototype.live.verify = function() {
    console.dir(this.state);
  }

  /*
  View only methods
   */
  Tree.prototype.live.mark = null;

  Tree.prototype.live.markPath = null;

  Tree.prototype.live.clearPath = null;

  Tree.prototype.live.showHeights = null;

  Tree.prototype.live.hideHeights = null;

  Tree.prototype.live.clearlabels = null;

  Tree.prototype.live.clearfocus = null;

  Tree.prototype.live.travel = null;

  Tree.prototype.live.label = null;

  Tree.prototype.live.focusOn = null;

  // utils:

  Tree.prototype._copyTree = function(_node, parent) {
    // this should use either left or _left to lookup child references
    console.log('copying tree');
    if(!_node) return null;
    var n = node(_node.value);
    if(_node.sid)
      n.sid = _node.sid;
    else
      n.sid = S.nextId();
    n.parent = parent;
    n.left = this._copyTree(_node.left || node._left, n);
    n.right = this._copyTree(_node.right || node._right, n);
    if(n.sid == 'sid_0') {
      console.log('ROOT');
      console.dir(n);
    }
    this.nodeMap[n.sid] = n;
    return n;
  }

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
      right: null
    };
  }



  S.defineComponent2('tree', Tree);

})();