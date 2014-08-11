S.component('tree', function (tree, view) {
  var c = new S.Component(), //S.base(),
      height = 0;

  function node(value) {
    return {
      value: value,
      left: null,
      right: null,
      sid: S.nextId()
    };
  }

  c.init = function() {
    c.tree = copyTree(tree, null);
    height = computeHeights(c.tree);
    computeHeights(c.tree);
  }
      
  c.height = function() {
    return height;
  }
  
  function copyTree(_node, parent) {
    if(!_node) return null;
    var n = node(_node.value);
    n.parent = parent;
    n.left = copyTree(_node.left, n);
    n.right = copyTree(_node.right, n);
    return n;
  }
  
  function computeHeights(root) {
    if(root)
      return root.height = 1 + Math.max(computeHeights(root.left), computeHeights(root.right));
    return -1;
  }

  c.computeHeights = function() {
    computeHeights(c.tree);
  }

  c.live.root = function() {
    if(c.tree)
      return c.tree;
  }
  
  c.live.height = function() {
    return height;
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

  c.live.clear = function() {
    c.tree = node('__');
  }

  c.live.remove = function(node) {
    if(node.parent) {
      if(node.parent.left == node) {
        node.parent.left = null;
      } else {
        node.parent.right = null;
      }
    }
  }

  c.live.mark = null;

  c.live.markPath = null;

  c.live.clearPath = null;

  c.live.showHeights = null;

  c.live.hideHeights = null;

  c.live.height = null;

  c.live.clearlabels = null;
  
  c.live.clearfocus = null;
  
  c.live.travel = null;
  
  c.live.label = null;
  
  c.live.focusOn = null;
  
  c.live.setNode = function(node, value) {
    node.value = value;
  }; 
  
  c.live.isBinary = function() {
    return checkBST(c.tree);
  };
  
  function checkBST(root) {
    if(root) {
      var ret = true;
      if(root.left) {
        ret = root.left.value <= root.value;
      }
      if(root.right && ret) {
        ret = root.right.value >= root.value;
      }
      return ret && checkBST(root.left) && checkBST(root.right);
    } else {
      return true; // null tree is vacuously BST
    }
  }
  
  c.getMethods = function() {
    return S.getComponentMethods('tree');
  }
  
  // TODO, add copy method
  c.noCopy = true;

  return c;
});