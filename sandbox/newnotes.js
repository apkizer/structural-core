function Tree(state, view) {
  S.Component.call(this, state, view);
}

Tree.prototype = Object.create(S.Component.prototype);

Tree.prototype.live.root = function() {
  return this.state.tree;
}

Tree.prototype.live.add = function(parent, direction, value) {
  var ret;
  if(direction) {
    ret = parent.right = node(value);
  } else {
    ret = parent.left = node(value);
  }
  computeHeights(c.tree);
  // TODO if avl, avl stuff here
  return ret;
}

c.live.add = function(parent, direction, value) {
  var ret;
  if(direction) {
    ret = parent.right = node(value);
  } else {
    ret = parent.left = node(value);
  }
  computeHeights(c.tree);
  // TODO if avl, avl stuff here
  return ret;
}