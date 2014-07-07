function makeTree(view) {
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

  c.live.focus = null;

  return c;
}

function makeTreeView() {
  var view = S.view(),
    elems = S.map(),
    positions = S.map(),
    opts = {
      mh: 30,
      mv: 50
    },
    $e,
    svg,
    $svg;

  view.init = function() {
    $e = $('<div class="tree"></div>');
    // http://stackoverflow.com/questions/20045532/snap-svg-cant-find-dynamically-and-successfully-appended-svg-element-with-jqu
    var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    $e.append($(svgElement));
    $svg = $e.find('svg').first();
    $svg.addClass('tree-svg');
    svg = Snap(svgElement);
    console.log('typeof elem ' + typeof $e.find('svg').first().get());
    rg(view.component.tree, positions, opts);
    drawLines(view.component.tree);
    drawTree(view.component.tree);
    drawValues(view.component.tree);
  }

  function drawNode(node, value, x, y) {
    var circle = svg.circle(x, y, 10);
    circle.addClass('tree-node');
    elems(node, circle);
  }
    
    function drawValues(root) {
        if(root) {
            svg.text(positions(root).x + 500 - 5, positions(root).y + 10 + 5, root.value + '')
                .addClass('tree-node-value');
            drawValues(root.left);
            drawValues(root.right);
        }
    }
    
    function drawLines(root) {
        if(root.left) {
            svg.line(positions(root).x + 500, positions(root).y + 10, positions(root.left).x + 500, positions(root.left).y + 10).attr('stroke', 'black');
            drawLines(root.left);
        }
        if(root.right) {
            svg.line(positions(root).x + 500, positions(root).y + 10, positions(root.right).x + 500, positions(root.right).y + 10).attr('stroke', 'black');
            drawLines(root.right);
        }
    }

  function drawTree(root) {
    if(!root)
      return;
    drawNode(root, root.value, positions(root).x + 500, positions(root).y + 10);
    drawTree(root.left);
    drawTree(root.right);
  };

  view.scaleTo = function(dimensions) {
    $e.width(dimensions.width);
    $e.height(dimensions.height);
  }


  view.render = function() {
    return $e;
  }
  

  view.focus = function(node, fn) {
    focus(elems(node), fn);
  }

  function focus($elem, fn) {
    $elem.addClass('focus');
    S.wait(function(){
      $elem.removeClass('focus');
      fn();
    }, 500);
  }


  view.add = function(parent_s, left, value, fn) {
    elems(parent_s, getNodeElement(value));
    rg(view.component.tree, positions, opts);
    elems.forEach(function(pair){
      move(elems(pair[0]), pair[1].x, pair[1].y, function(){
        $e.append(elems(parent_s));
      });
    });
  }

  function move($elem, x, y, fn) {
    $elem.animate({
      left: x,
      top: y
    }, 250, function(){
      fn();
    });
  }

  function getNodeElement(value) {
    return $('<span class="node">' + value + '</span>')
  }

  function rg(root, store, options) {
    //1. copy tree
    //2. run rg
    //3. copy to store


    var config = {
      mh: 10,
      mv: 10
    };

    $.extend(config, options);
    var _root = copyTree(root);
    console.log('printing _root');
    printTree(_root);
    setup(_root, 0, null, null);
    assign(_root, 0, false);
    copyToStore(_root, store);

    function RNode(node) {
      console.log('R ' + node.value);
      this.value = node.value;
      this.left = null;//node.left;
      this.right = null;//node.right;
      this.x = 0;
      this.y = 0;
      this.thread = false;
      this.offset = 0;
      this.sid = node.sid;
    }

    function Extreme(node) {
      this.node = node;
      this.offset = 0;
      this.level = 0;
    }

    function copyTree(node) {
      var copy;
      if(!node)
        copy = null;
      else {
        /*copy = {};
         copy.value = node.value;*/
        copy = new RNode(node);
        copy.left = copyTree(node.left);
        copy.right = copyTree(node.right);
      }
      return copy;
    }

    function printTree(root) {
      if(!root)
        return;
      console.log(root.value)
      printTree(root.left);
      printTree(root.right);
    }

    function setup(node, level, rightMost, leftMost) {
      var left,
        right,
        lRightMost = new Extreme(null),
        lLeftMost = new Extreme(null),
        rRightMost = new Extreme(null),
        rLeftMost = new Extreme(null);

      // while loop variables:
      var currentSeparation, // The separation between contour nodes on the current level
        rootSeparation, // ?
        leftOffsetSum,  // offset from root
        rightOffsetSum; // offset from root


      if(!node /*== null*/) {
        // base case ?
        // ? update leftMost, rightMost
        leftMost.level = -1;
        rightMost.level = -1;
        return;
      }

      node.y = level * config.mv;
      left = node.left;
      console.log('left is ' + left);
      right = node.right;
      setup(left, level + 1, lRightMost, lLeftMost);
      setup(right, level + 1, rRightMost, rLeftMost);
      if(left === null && right === null) {
        // node is a leaf
        // base case?
        rightMost.node = node;
        leftMost.node = node;
        rightMost.level = level; // single node is both rightMost and leftMost on lowest level (which is current level)
        leftMost.level = level;
        rightMost.offset = 0; // ? TODO
        leftMost.offset = 0;  // ? TODO
        node.offset = 0;
      } else {
        // node is not a leaf

        currentSeparation = config.mh; // margin = minimum separation between two nodes on a level
        rootSeparation = config.mh; // ? TODO
        leftOffsetSum = 0;
        rightOffsetSum = 0;

        while(left !== null && right !== null) {

          if(currentSeparation < config.mh) { // nodes are too close together

            // Increase rootSeparation just enough so that it accounts for difference between
            // config.mh and currentSeparation:
            rootSeparation += (config.mh - currentSeparation);

            // Now, increase currentSeparation to the minimumSeparation:
            currentSeparation = config.mh;

          }

// left contour:
          if(left.right !== null) {

            // leftOffsetSum is offset of left from root
            // left.offset = distance to each son
            // increase leftOffsetSum by left's offset from each child:
            leftOffsetSum += left.offset;

            // At this level, now, currentSeparation is decreased by left.offset,
            // because that is how far out left's right child is stick out.
            currentSeparation -= left.offset;

            // Go to next level, next on contour:
            left = left.right;
          } else {

            //left.right is null.

            // We can move left in now:
            leftOffsetSum -= left.offset; // ? TODO

            // We've allowed more separation ?
            currentSeparation += left.offset;

            // Go to next level, next on contour:
            left = left.left;
          }

// right contour:
          if(right.left !== null) {
            rightOffsetSum -= right.offset;
            currentSeparation -= right.offset;
            right = right.left;
          } else {
            rightOffsetSum += right.offset;
            currentSeparation += right.offset;
            right = right.right;
          }

        }

// set root's offset:
        node.offset = (rootSeparation + 1) / 2;
// ? TODO :
        leftOffsetSum -= node.offset;
        rightOffsetSum += node.offset;

// determine 2 extremes from the 4 we have:
// pick leftMost:
        if(rLeftMost.level > lLeftMost.level || node.left == null) {
          // rLeftMost wins
          leftMost = rLeftMost;
          leftMost.offset += node.offset; // ? TODO
        } else {
          // lLeftMost wins
          leftMost = lLeftMost;
          leftMost.offset -= node.offset;
        }


// threading:
// necessary if uneven heights? TODO

        if(left != null && left != node.left) {
          rRightMost.node.thread = true;
          // no idea what's going on here: TODO
          rRightMost.node.offset = Math.abs( (rRightMost.offset + node.offset) - leftOffsetSum);
          if(leftOffsetSum - node.offset <= rRightMost.offset) {
            rRightMost.node.left = left;
          } else {
            rRightMost.node.right = left;
          }
        } else if(right != null && right != node.right) {
          lLeftMost.node.thread = true;
          lLeftMost.node.offset = Math.abs( (lLeftMost.offset - node.offset) - rightOffsetSum);
          if(rightOffsetSum + node.offset >= lLeftMost.offset) {
            lLeftMost.node.right = right;
          } else {
            lLeftMost.node.left = right;
          }
        } else {
          // nothing
        }

      }


    }

    function assign(node, x, useNew) {
      if(node != null) {
        node.x = x;
        if(node.thread) {
          // clean up threading:
          node.thread = false;
          node.right = null;
          node.left = null;
        }
        // ? TODO
        assign(node.left, x - node.offset, useNew);
        assign(node.right, x + node.offset, useNew);
      }
    }

    function copyToStore(root, store) {

      if(!root)
        return;
      console.log('STORING ' + root.sid);
      store(root, {
        x: root.x,
        y: root.y
      });
      copyToStore(root.left, store);
      copyToStore(root.right, store);
    }


  }

  return view;
}





