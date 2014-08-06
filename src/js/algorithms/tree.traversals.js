S.method('tree', 'traversal', function traversal() {
                //c.focus(c.root());
                //preorder(c.root());
                inorder(this.root());
                
                /*function preorder(node) {
                    if(node) {
                        this.focusNode(node);
                        preorder(node.left);
                        preorder(node.right);
                    }
                }*/
                
                function inorder(node) {
                    if(node) {
                        inorder(node.left);
                        this.focusNode(node);
                        //c.push(node.value);//array
                        inorder(node.right);
                    }
                }
            });