S.method('tree', 'traversal', function traversal() {
  //c.focus(c.root());
  //preorder.bind(this);
  preorder.call(this, this.root());
  console.log('commencing traversal');
  //inorder(this.root());

  function preorder(node) {
     if(node) {
       this.focusOn(node);
       this.clearfocus();
       //console.log('printing ' + node);
       preorder.call(this, node.left);
       preorder.call(this, node.right);
     }
   }

  function inorder(node) {
    console.log('inorder');
    if (node) {
      inorder(node.left);
      console.log('focusing on ' + node);
      this.focusOn(node);
      inorder(node.right);
    }
  }
  console.log('finishing traversal');
});