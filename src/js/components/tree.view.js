S.TreeView = (function () {

    function TreeView(element) {
        S.View.call(this, element);
        this._ = {};
        this._.data = S.map();
        this.options = {
            classes: {
                svg: 'tree-svg',
                node: 'tree-node',
                value: 'tree-value',
                height: 'tree-height',
                label: 'tree-label',
                line: 'tree-line',
                hidden: 'tree-hidden',
                nodeFocus : 'tree-node--focused'
            },
            easings: {
                remove: mina.easeinout
            }
        };
        this.view = this;
    }

    TreeView.prototype = Object.create(S.View.prototype);
    TreeView.prototype.constructor = TreeView;

    TreeView.prototype.init = function () {
        this.scale({
            width: this.$element.width(),
            height: this.$element.height()
        });
    };

    /**
     * Sets drawing variables based on dimensions.width and dimensions.height
     * @param dimensions
     * @returns {*}
     */
    TreeView.prototype.scale = function (dimensions) {
        var _ = this._,
            nodeRadiusPct = .05,
            nodeMvPct = .2;
        _.width = dimensions.width;
        _.height = dimensions.height;
        _.x0 = _.width / 2;
        _.nodeRadius = nodeRadiusPct * _.height; // TODO
        _.y0 = _.nodeRadius;
        _.mv = nodeMvPct * _.height; // TODO
        _.mh = _.mv + _.nodeRadius / 2; // TODO
        return this.render();
    };

    TreeView.prototype.render = function () {
        console.log('state is ');
        console.dir(this.component.state);
        var self = this,
            _ = self._;
        this.clear();
        // http://stackoverflow.com/questions/20045532/snap-svg-cant-find-dynamically-and-successfully-appended-svg-element-with-jqu
        _._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        _.svg = Snap(_._svg);
        _.svg.addClass(this.options.classes.svg);
        this._.svg.attr({
            width: _.width,
            height: _.height
        });
        TreeView.rg(this.component.state, _.data, {
            mh: _.mh,
            mv: _.mv,
            x0: _.x0,
            y0: _.y0
        });
        this._drawLines(this.component.state);
        this.allNodes(this.component.state, function (node) {
            console.log('drawing node with value ' + node.value);
            _.data(node).element = self._drawNode(node, _.data(node).x, _.data(node).y);
            _.data(node).s_value = self._drawValue(node.value, _.data(node).x, _.data(node).y);
            _.data(node).s_height = self._drawHeight(node.height, _.data(node).x, _.data(node).y);
        });
        this.$element.append(_._svg);
    };

    TreeView.prototype._drawLines = function (tree) {
        var _ = this._;
        if (tree.left) {
            _.data(tree).leftLine = this._drawLine(_.data(tree).x, _.data(tree).y, _.data(tree.left).x, _.data(tree.left).y);
            this._drawLines(tree.left);
        }
        if (tree.right) {
            _.data(tree).rightLine = this._drawLine(_.data(tree).x, _.data(tree).y, _.data(tree.right).x, _.data(tree.right).y);
            this._drawLines(tree.right);
        }
    };

    TreeView.prototype._drawLine = function (xi, yi, xf, yf) {
        return this._.svg.line(xi, yi, xf, yf)
            .addClass(this.options.classes.line);
    };

    TreeView.prototype.allNodes = function (tree, fn) {
        if (tree) {
            fn(tree);
            this.allNodes(tree.left, fn);
            this.allNodes(tree.right, fn);
        }
    };

    TreeView.prototype._drawNode = function (node, x, y) {
        return this._.svg.circle(x, y + 2, this._.nodeRadius)
            .addClass(this.options.classes.node);
    };

    TreeView.prototype._drawValue = function (value, x, y) {
        // TODO get rid of magic numbers
        var _ = this._;
        return _.svg.text(x, y + _.nodeRadius * .5 + 2, value + '')
            .addClass(this.options.classes.value)
            .attr('text-anchor', 'middle')
            .attr('font-size', _.nodeRadius * 1.25);
    };

    TreeView.prototype._drawHeight = function (height, nodeX, nodeY) {
        var _ = this._;
        return _.svg.text(nodeX - _.nodeRadius - _.nodeRadius * .85, nodeY + _.nodeRadius / 2 - 3, height + '')
            .attr('font-size', _.nodeRadius)
            .addClass(this.options.classes.height);
    };

    TreeView.prototype._drawLabel = function(node, label) {
        var _ = this._;
        return _.svg.text(_.data(node).x + _.nodeRadius + 5, _.data(node).y + _.nodeRadius / 2 - 3, '/' + label)
            .addClass(this.options.classes.label)
            .attr('text-anchor', 'right')
            .attr('font-size', _.nodeRadius);
    };

    TreeView.prototype.add = function (parent, direction, value, fn) {
        var parent = this.component.getNode(parent.sid),
            _ = this.view._;
        this.view.scaleTo({
            width: _.width,
            height: _.height
        });
        this.view.render();
        fn();
    };

    TreeView.prototype.set = function (node, value, fn) {
        // TODO change classnames
        var _ = this.view._,
            s_node = _.data(node).element,
            s_value = _.data(node).s_value;
        S.wait(function () {
            s_node.addClass('tree-remove');
            s_value.addClass('tree-remove');
            S.wait(function () {
                s_node.removeClass('tree-remove');
                s_value.removeClass('tree-remove')
                    .attr('text', value);
                fn();
            }, 300);
        }, 200);
    };

    TreeView.prototype.remove = function (node, fn) {
        var view = this.view,
            _ = view._,
            elements = getTreeElements(node, _.data),
            parent = node.parent,
            count = 0,
            max;
        if (parent && parent.left == null && _.data(parent).leftLine) {
            elements.push(_.data(parent).leftLine);
            delete _.data(parent).leftLine;
        } else if(parent && parent.right == null && _.data(parent).rightLine) {
            elements.push(_.data(parent).rightLine);
            delete _.data(parent).rightLine;
        }
        max = elements.length;
        elements.forEach(function (element) {
            count++;
            if (!element) return;
            if (element.attr('cy')) {
                element.animate({
                    cy: 1000
                }, 500, view.options.easings.remove, checkIfAllRemoved);
            } else if (element.attr('y1')) {
                element.animate({
                    y1: 1000,
                    y2: 1000
                }, 500, view.options.easings.remove, checkIfAllRemoved);
            } else {
                element.animate({
                    y: 1000
                }, 500, view.options.easings.remove, checkIfAllRemoved);
            }
        });

        function checkIfAllRemoved() {
            if (count >= max) {
                elements.forEach(function (element) {
                    if (element) {
                        element.remove();
                    }
                });
                view.render();
                fn();
            }
        }
    };

    TreeView.prototype.focus = function (node, fn) {
        node = this.view.component.getNode(node.sid);
        if(node)
            this.view._.data(node).element.addClass('focus');
        fn();
    };

    TreeView.prototype.unfocus = function (node, fn) {
        node = this.view.component.getNode(node.sid);
        if(node)
            this.view._.data(node).element.removeClass('focus');
        fn();
    };

    TreeView.prototype.clearFocus = function (node, fn) {
        var view = this.view,
            _ = view._;
        view.allNodes(view.component.state, function(node) {
            _.data(node).element.removeClass('focus');
        });
    }

    TreeView.prototype.travel = function (parent, direction, fn) {
        var _ = this.view._;
        if(direction) {
            if(_.data(parent).rightLine) {
                var rightLine = _.data(parent).rightLine;
                rightLine.addClass('tree-line-active');
                var s_circle = _.svg.circle(rightLine.attr('x1'), rightLine.attr('y1'), 5)
                    .addClass('tree-travelorb');
                s_circle.insertAfter(rightLine);
                s_circle.animate({
                    cx: rightLine.attr('x2'),
                    cy: rightLine.attr('y2')
                }, 500, null, function() {
                    s_circle.remove();
                    rightLine.removeClass('tree-line-active');
                    fn();
                });
            } else {
                fn();
            }
        } else {
            if(_.data(parent).leftLine) {
                var leftLine = _.data(parent).leftLine;
                leftLine.addClass('tree-line-active');
                var s_circle = _.svg.circle(leftLine.attr('x1'), leftLine.attr('y1'), 5)
                    .addClass('tree-travelorb');
                s_circle.insertAfter(leftLine);
                s_circle.animate({
                    cx: leftLine.attr('x2'),
                    cy: leftLine.attr('y2')
                }, 500, null, function() {
                    s_circle.remove();
                    leftLine.removeClass('tree-line-active');
                    fn();
                });
            } else {
                fn();
            }
        }
    };

    TreeView.prototype.label = function (node, label, fn) {
        console.log('trying to label ' + node.value);
        var _ = this.view._;
        if(node && _.data(node)) {
            _.data(node).label = label;
            _.data(node).s_label = this.view._drawLabel(node, label);
            fn();
        } else {
            fn();
        }
    };

    TreeView.prototype.clearLabels = function (fn) {
        var view = this.view,
            _ = view._;
        view.allNodes(view.component.state, function(node) {
            _.data(node).s_label.remove();
        });
    };

    /*
     options: {
     heights: true/false,
     labels: true/false,
     values: true/false,
     lines: true/false,
     nodes: true/false
     }
     */
    // TODO
    TreeView.prototype.display = function (options, fn) {
        console.info('display');
        var view = this.view,
            _ = view._;
        view.allNodes(view.component.state, function(node) {
            var data = _.data(node);
            if(options.heights)
                data.s_height.removeClass(view.options.classes.hidden);
            if(options.heights === false)
                data.s_height.addClass(view.options.classes.hidden);
            if(options.labels)
                data.s_label.removeClass(view.options.classes.hidden);
            if(options.labels === false)
                data.s_label.addClass(view.options.classes.hidden);
            if(options.values)
                data.s_value.removeClass(view.options.classes.hidden);
            if(options.values === false)
                data.s_value.addClass(view.options.classes.hidden);
            if(options.lines) {
                data.leftLine.removeClass(view.options.classes.hidden);
                data.rightLine.removeClass(view.options.classes.hidden);
            }
            if(options.lines === false) {
                data.leftLine.addClass(view.options.classes.hidden);
                data.rightLine.addClass(view.options.classes.hidden);
            }
            if(options.nodes)
                data.element.removeClass(view.options.classes.hidden);
            if(options.nodes === false)
                data.element.addClass(view.options.classes.hidden);
        });
    };

    function getTreeElements(root, data) {
        var ret = [];
        if (root) {
            ret.push(data(root).element);
            ret.push(data(root).s_height);
            ret.push(data(root).s_value);
            ret.push(data(root).s_label);
            ret.push(data(root).leftLine);
            ret.push(data(root).rightLine);
            return ret.concat(getTreeElements(root.left, data).concat(getTreeElements(root.right, data)));
        }
        return ret;
    }


    // TODO clean up:
    /**
     * The Reingold-Tilford tree drawing algorithm.
     * @param root The root of the tree to draw.
     * @param store An S.Map where position data will be stored.
     * @param options An object specifying
     * `mh` The horizontal node margin.
     * 'mv' The spacing between levels.
     * `xProperty` The property to store x values.
     * `yProperty` The property to store y values.
     */
    TreeView.rg = function (root, store, options) {
        //1. copy tree
        //2. run rg
        //3. copy to store


        var config = {
            mh: 10,
            mv: 10,
            xProperty: 'x',
            yProperty: 'y'
        };

        $.extend(config, options);
        var _root = copyTree(root);
        //console.log('printing _root');
        //printTree(_root);
        setup(_root, 0, null, null);
        assign(_root, 0, false);
        copyToStore(_root, store);

        function RNode(node) {
            //console.log('R ' + node.value);
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
            if (!node)
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
            if (!root)
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


            if (!node /*== null*/) {
                // base case ?
                // ? update leftMost, rightMost
                leftMost.level = -1;
                rightMost.level = -1;
                return;
            }

            node.y = level * config.mv;
            left = node.left;
            //console.log('left is ' + left);
            right = node.right;
            setup(left, level + 1, lRightMost, lLeftMost);
            setup(right, level + 1, rRightMost, rLeftMost);
            if (left === null && right === null) {
                // node is a leaf
                // base case?
                if (leftMost && rightMost) {
                    rightMost.node = node;
                    leftMost.node = node;
                    rightMost.level = level; // single node is both rightMost and leftMost on lowest level (which is current level)
                    leftMost.level = level;
                    rightMost.offset = 0; // ? TODO
                    leftMost.offset = 0;  // ? TODO
                }
                node.offset = 0;
            } else {
                // node is not a leaf

                currentSeparation = config.mh; // margin = minimum separation between two nodes on a level
                rootSeparation = config.mh; // ? TODO
                leftOffsetSum = 0;
                rightOffsetSum = 0;

                while (left !== null && right !== null) {

                    if (currentSeparation < config.mh) { // nodes are too close together

                        // Increase rootSeparation just enough so that it accounts for difference between
                        // config.mh and currentSeparation:
                        rootSeparation += (config.mh - currentSeparation);

                        // Now, increase currentSeparation to the minimumSeparation:
                        currentSeparation = config.mh;

                    }

// left contour:
                    if (left.right !== null) {

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
                    if (right.left !== null) {
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
                if (rLeftMost.level > lLeftMost.level || node.left == null) {
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

                if (left != null && left != node.left && rRightMost.node) {
                    rRightMost.node.thread = true;
                    // no idea what's going on here: TODO
                    rRightMost.node.offset = Math.abs((rRightMost.offset + node.offset) - leftOffsetSum);
                    if (leftOffsetSum - node.offset <= rRightMost.offset) {
                        rRightMost.node.left = left;
                    } else {
                        rRightMost.node.right = left;
                    }
                } else if (right != null && right != node.right && lLeftMost.node) {
                    lLeftMost.node.thread = true;
                    lLeftMost.node.offset = Math.abs((lLeftMost.offset - node.offset) - rightOffsetSum);
                    if (rightOffsetSum + node.offset >= lLeftMost.offset) {
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
            if (node != null) {
                node.x = x;
                if (node.thread) {
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

            if (!root)
                return;
            store(root)[config.xProperty] = root.x + config.x0 || 0;
            store(root)[config.yProperty] = root.y + config.y0 || 0;
            /*store(root, {
             x: root.x,
             y: root.y
             });*/
            copyToStore(root.left, store);
            copyToStore(root.right, store);
        }


    };

    return TreeView;
})();