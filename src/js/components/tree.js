S.add('tree', function (view) {
  var c = S.base(view),
    nodes = S.map();
  c.tree = new Node(0);

  function Node(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.sid = S.nextId();
  }

  c.init = function(root) {
    c.tree = copyTree(root);
  }

  function copyTree(node) {
    if(!node)
      return null;
    var n = new Node(node.value);
    n.left = copyTree(node.left);
    n.right = copyTree(node.right);
    return n;
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

  c.live.focusNode = null;

  return c;
});