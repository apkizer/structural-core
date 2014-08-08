S.component('tree', function (tree, view) {
  var c = S.base(),
    nodes = S.map(),
    height = 0;
  c.tree = new Node(0);

  c.live.clearfocus = null;

  function Node(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.sid = S.nextId();
  }

  c.init = function() {
    console.log('init tree');
    c.tree = copyTree(tree);
    height = determineHeight(c.tree);
    computeHeight(c.tree);
  }

  function copyTree(node) {
    if(!node)
      return null;
    var n = new Node(node.value);
    n.left = copyTree(node.left);
    n.right = copyTree(node.right);
    return n;
  }
  
  function computeHeight(root) {
    console.log('computing height');
    if(root) {
      console.log('height is ' +  (1 + Math.max(computeHeight(root.left), computeHeight(root.right))));
      root.height = 1 + Math.max(computeHeight(root.left), computeHeight(root.right));
      return root.height;
    } else {
      return -1;
    }
  }
  
  function determineHeight(root) {
    if(!root)
      return -1;
    return 1 + Math.max(determineHeight(root.left), determineHeight(root.right));
    
  }
      
  c.height = function() {
    return height;
  }

  c.live.root = function() {
    if(c.tree)
      return c.tree;//.sid;
  }
  
  c.live.add = function(parent, direction, value) {
    if(direction) {
      parent.right = new Node(value);
    } else {
      parent.left = new Node(value);
    }
    computeHeight(c.tree);
  }
  
  c.live.traverse = null;
  
  c.live.travel = null;
  
  c.live.label = null;

  c.live.focusOn = null;
  
  c.getMethods = function() {
    return S.getComponentMethods('tree');
  }
  
  c.noCopy = true;

  return c;
});