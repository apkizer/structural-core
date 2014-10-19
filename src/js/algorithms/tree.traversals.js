S.method(function traversal(tree, kind) {

    console.info('Tree travesal');

    var count = 0;
    if (kind)
        kind = kind.trim().toLowerCase();

    if (kind === 'pre' || kind === 'preorder') {
        preorder.call(this, tree.root());
    } else if (kind === 'in' || kind === 'inorder') {
        inorder.call(this, tree.root());
    } else if (kind === 'post' || kind === 'postorder') {
        postorder.call(this, tree.root());
    } else {
        inorder.call(this, tree.root());
    }

    function preorder(node) {
        if (node) {
            visit.call(this, node);
            tree.travel(node, false);
            preorder.call(this, node.left);
            tree.travel(node, true);
            preorder.call(this, node.right);
        }
    }

    function inorder(node) {
        if (node) {
            tree.travel(node, false);
            inorder.call(this, node.left);
            visit.call(this, node);
            tree.travel(node, true);
            inorder.call(this, node.right);
        }
    }

    function postorder(node) {
        if (node) {
            tree.travel(node, false);
            postorder.call(this, node.left);
            tree.travel(node, true);
            postorder.call(this, node.right);
            visit.call(this, node);
        }
    }

    function visit(node) {
        tree.focus(node);
        label.call(this, node);
    }

    function label(node) {
        tree.label(node, count);
        count++;
    }

}, 'traversal', 'tree');