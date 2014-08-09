S.method('tree', 'traversal', function traversal(kind) {
  
  var count = 0;
  if(kind)
    kind = kind.trim().toLowerCase();
  
  if(kind === 'pre' || kind === 'preorder') {
    preorder.call(this, this.root());
  } else if(kind === 'in' || kind === 'inorder') {
    inorder.call(this, this.root());
  } else if(kind === 'post' || kind === 'postorder') {
    postorder.call(this, this.root());
  } else {
    inorder.call(this, this.root());
  }
  
  this.finish();

  function preorder(node) {
     if(node) {
       visit.call(this, node);
       this.travel(node, false);
       preorder.call(this, node.left);
       this.travel(node, true);
       preorder.call(this, node.right);
     }
   }

  function inorder(node) {
    if (node) {
      this.travel(node, false);
      inorder.call(this, node.left);
      visit.call(this, node);
      this.travel(node, true);
      inorder.call(this, node.right);
    }
  }
  
  function postorder(node) {
    if(node) {
      this.travel(node, false);
      postorder.call(this, node.left);
      this.travel(node, true);
      postorder.call(this, node.right);
      visit.call(this, node);
    }
  }
  
  function visit(node) {
    this.focusOn(node);
    label.call(this, node);
  }
  
  function label(node) {
    this.label(node, count);
    count++;
  }
 
});