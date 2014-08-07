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
  }

  function copyTree(node) {
    if(!node)
      return null;
    var n = new Node(node.value);
    n.left = copyTree(node.left);
    n.right = copyTree(node.right);
    return n;
  }
  
  function determineHeight(root) {
    if(!root)
      return -1;
    return 1 + Math.max(determineHeight(root.left), determineHeight(root.right));
  }
      
  c.height = function() {
    return height;
  }

  c.live.add = function(parent, left, value) {
    if(!nodes.has(parent))
      return;
    if(left) {
      nodes(parent).left = new Node(value);
    } else {
      nodes(parent).right = new Node(value);
    }
  }

  c.live.root = function() {
    if(c.tree)
      return c.tree;//.sid;
  }
  
  c.live.traverse = null;

  c.live.focusOn = null;
  
  c.getMethods = function() {
    return S.getComponentMethods('tree');
  }
  
  c.noCopy = true;

  return c;
});