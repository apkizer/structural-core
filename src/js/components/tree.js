

S.component('tree', function (tree, view) {
  var c = new S.Component(),
      height = 0;
  c.alias = 'tree';
  c.live = {};


  c.init = function() {
    c.tree = copyTree(tree, null);
    c.state = tree;
    height = computeHeights(c.tree);
    computeHeights(c.tree);
  }

  c.height = function() {
    return height;
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
    /*if(node.parent) {
      if(node.parent.left == node) {
        console.info('Setting parent.left to null');
        node.parent.left = null;
      } else {
        console.info('Setting parent.right to null');
        node.parent.right = null;
      }
    }*/
    
    if(node.parent && node.parent.left == node) {
        console.info('Setting parent.left to null');
        node.parent.left = null;
    } else if(node.parent && node.parent.right == node) {
        console.info('Setting parent.right to null');
        node.parent.right = null;
    } else {
        console.info('node.parent doesn\'t exist.');
    }
    
    c.computeHeights();
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