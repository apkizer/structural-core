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
                nodeFocus: 'tree-node--focused'
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
        TreeView.rg(this.component.state);
        this._drawLines(this.component.state);
        this.allNodes(this.component.state, function (node) {
            // transform the node coordinates to appropriate coordinates and delete the position properties
            _.data(node).x = _.x0 + node.x * _.mh / 2;
            _.data(node).y = _.y0 + node.y * _.mv;
            delete node.x;
            delete node.y;
            console.log('drawing node with value ' + node.value);
            _.data(node).element = self._drawNode(node, _.data(node).x, _.data(node).y);
            _.data(node).s_value = self._drawValue(node.value, _.data(node).x, _.data(node).y);
            _.data(node).s_height = self._drawHeight(node.height, _.data(node).x, _.data(node).y);
        });
        this.drawGridDots();
        this.$element.append(_._svg);
    };

    TreeView.prototype.drawGridDots = function () {
        for(var i = - 2 * this._.mh; i < this._.svg.attr('width'); i += this._.mh * .5) {
            for(var j = 0; j < this._.svg.attr('height'); j += this._.mv) {
                this._.svg.circle(this._.x0 + i, this._.y0 + j, 2)
                    .attr('fill', '#000000');
            }
        }

    }

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

    TreeView.prototype._drawLabel = function (node, label) {
        var _ = this._;
        return _.svg.text(_.data(node).x + _.nodeRadius + 5, _.data(node).y + _.nodeRadius / 2 - 3, '/' + label)
            .addClass(this.options.classes.label)
            .attr('text-anchor', 'right')
            .attr('font-size', _.nodeRadius);
    };

    TreeView.prototype.add = function (parent, direction, value, fn) {
        var parent = this.component.getNode(parent.sid),
            _ = this.view._;
        this.scale({
            width: _.width,
            height: _.height
        });
        this.render();
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
        } else if (parent && parent.right == null && _.data(parent).rightLine) {
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
        if (node)
            this.view._.data(node).element.addClass('focus');
        fn();
    };

    TreeView.prototype.unfocus = function (node, fn) {
        node = this.view.component.getNode(node.sid);
        if (node)
            this.view._.data(node).element.removeClass('focus');
        fn();
    };

    TreeView.prototype.clearFocus = function (node, fn) {
        var view = this.view,
            _ = view._;
        view.allNodes(view.component.state, function (node) {
            _.data(node).element.removeClass('focus');
        });
    }

    TreeView.prototype.travel = function (parent, direction, fn) {
        var _ = this.view._;
        if (direction) {
            if (_.data(parent).rightLine) {
                var rightLine = _.data(parent).rightLine;
                rightLine.addClass('tree-line-active');
                var s_circle = _.svg.circle(rightLine.attr('x1'), rightLine.attr('y1'), 5)
                    .addClass('tree-travelorb');
                s_circle.insertAfter(rightLine);
                s_circle.animate({
                    cx: rightLine.attr('x2'),
                    cy: rightLine.attr('y2')
                }, 500, null, function () {
                    s_circle.remove();
                    rightLine.removeClass('tree-line-active');
                    fn();
                });
            } else {
                fn();
            }
        } else {
            if (_.data(parent).leftLine) {
                var leftLine = _.data(parent).leftLine;
                leftLine.addClass('tree-line-active');
                var s_circle = _.svg.circle(leftLine.attr('x1'), leftLine.attr('y1'), 5)
                    .addClass('tree-travelorb');
                s_circle.insertAfter(leftLine);
                s_circle.animate({
                    cx: leftLine.attr('x2'),
                    cy: leftLine.attr('y2')
                }, 500, null, function () {
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
        if (node && _.data(node)) {
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
        view.allNodes(view.component.state, function (node) {
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
        view.allNodes(view.component.state, function (node) {
            var data = _.data(node);
            if (options.heights)
                data.s_height.removeClass(view.options.classes.hidden);
            if (options.heights === false)
                data.s_height.addClass(view.options.classes.hidden);
            if (options.labels)
                data.s_label.removeClass(view.options.classes.hidden);
            if (options.labels === false)
                data.s_label.addClass(view.options.classes.hidden);
            if (options.values)
                data.s_value.removeClass(view.options.classes.hidden);
            if (options.values === false)
                data.s_value.addClass(view.options.classes.hidden);
            if (options.lines) {
                data.leftLine.removeClass(view.options.classes.hidden);
                data.rightLine.removeClass(view.options.classes.hidden);
            }
            if (options.lines === false) {
                data.leftLine.addClass(view.options.classes.hidden);
                data.rightLine.addClass(view.options.classes.hidden);
            }
            if (options.nodes)
                data.element.removeClass(view.options.classes.hidden);
            if (options.nodes === false)
                data.element.addClass(view.options.classes.hidden);
        });
    };

    TreeView.prototype.transformNodeCoordinates = function (root, x0, y0, xs, ys) {

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

    /**
     * An implementation of the Reingold-Tilford tree drawing algorithm.
     * Adapted from http://emr.cs.iit.edu/~reingold/tidier-drawings.pdf
     * @param tree The tree to assign x and y properties to. After this function is called, each node in `tree`
     * will have x and y properties, where the root is at position 0, 0. Each level corresponds to an increment of y,
     * and every right step or left step from the root corresponds to an increment and decrement to x, respectively.
     */
    TreeView.rg = function(tree) {
        TreeView.rg.position(tree, 0, {
            /* extremes */
            lmost: {},
            rmost: {}
        }, {
            minimumSeparation: 1 //
        });
        TreeView.rg.absolute(tree, 0);
        TreeView.rg.cleanup(tree);
    }

    TreeView.rg.position = function (root, level, extremes, options) {
        var leftContourNode,
            rightContourNode,
            leftOffset, //
            rightOffset, //
            currentSeparation,
            rootSeparation,
            leftExtremes = {
                lmost: {},
                rmost: {}
            },
            rightExtremes = {
                lmost: {},
                rmost: {}
            }
        if(!root) {
            extremes.lmost.level = -1;
            extremes.rmost.level = -1;
            return;
        }
        root.y = level;
        leftContourNode = root.left;
        rightContourNode = root.right;
        TreeView.rg.position(leftContourNode, level + 1, leftExtremes, options); // recurse on left subtree
        TreeView.rg.position(rightContourNode, level + 1, rightExtremes, options); // recurse on right subtree
        if(!root.left && !root.right) {
            extremes.rmost.node = root;
            extremes.lmost.node = root;
            extremes.rmost.level = level;
            extremes.lmost.level = level;
            extremes.rmost.offset = 0;
            extremes.lmost.offset = 0;
            root.offset = 0;
            return;
        }
        currentSeparation = options.minimumSeparation;
        rootSeparation = options.minimumSeparation;
        // move apart subtrees
        while(leftContourNode && rightContourNode) {

            if(currentSeparation < options.minimumSeparation) {
                rootSeparation += (options.minimumSeparation - currentSeparation); // (minimumSeparation - currentSeparation) is the amount we have moved the nodes apart.
                currentSeparation = options.minimumSeparation;
            }

            // since threading is done on left and right properties, we don't worry if things have been threaded here
            if(leftContourNode.right) {
                leftOffset += leftContourNode.offset;
                currentSeparation -= leftContourNode.offset;
                leftContourNode = leftContourNode.right;
            } else {
                leftOffset -= leftContourNode.offset;
                currentSeparation += leftContourNode.offset;
                leftContourNode = leftContourNode.left;
            }
            if(rightContourNode.left) {
                rightOffset -= rightContourNode.offset;
                currentSeparation -= rightContourNode.offset;
                rightContourNode = rightContourNode.left;
            } else {
                rightOffset += rightContourNode.offset;
                currentSeparation += rightContourNode.offset;
                rightContourNode = rightContourNode.right;
            }

        }

        // set root.offset
        root.offset = (rootSeparation + 1) / 2; // why +1?
        leftOffset -= root.offset // (subtrees have been moved)
        rightOffset += root.offset

        // set lmost and rmost. we are augmenting these parameters for on-the-way-up recusion.
        // set lmost
        if(!root.left || rightExtremes.lmost.level > leftExtremes.lmost.level) {
            extremes.lmost = rightExtremes.lmost;
            extremes.lmost.offset += root.offset;
        } else {
            extremes.lmost = leftExtremes.lmost;
            extremes.lmost.offset -= root.offset;
        }
        // set rmost
        if(!root.right || leftExtremes.rmost.level > rightExtremes.rmost.level) {
            extremes.rmost = leftExtremes.rmost;
            extremes.rmost.offset -= root.offset;
        } else {
            extremes.rmost = rightExtremes.rmost;
            extremes.rmost.offset += root.offset;
        }

        // threading for next recursion only if subtrees are different heights and nonempty
        // at most only one thread has to be inserted

        if(leftContourNode && leftContourNode !== root.left) {
            rightExtremes.rmost.node.thread = true;
            rightExtremes.rmost.node.offset = Math.abs(rightExtremes.rmost.offset + root.offset - leftOffset);
            if(leftOffset - root.offset <= rightExtremes.rmost.offset)
                rightExtremes.rmost.node.left = leftContourNode;
            else
                rightExtremes.rmost.node.right = leftContourNode;
        } else if(rightContourNode && rightContourNode !== root.right) {
            leftExtremes.lmost.node.thread = true;
            leftExtremes.lmost.node.offset = Math.abs(leftExtremes.lmost.offset - root.offset - rightOffset);
            if(rightOffset + root.offset >= leftExtremes.lmost.offset)
                leftExtremes.lmost.node.right = rightContourNode;
            else
                leftExtremes.lmost.node.left = rightContourNode;
        }



    };

    TreeView.rg.absolute = function (tree, x) {
        if(tree) {
            tree.x = x;
            if(tree.thread) {
                tree.thread = false;
                tree.left = null; // threaded node must have been a leaf
                tree.right = null;
            }
            TreeView.rg.absolute(tree.left, x - tree.offset);
            TreeView.rg.absolute(tree.right, x + tree.offset);
        }
    }

    TreeView.rg.cleanup = function (tree) {
        if(tree) {
            delete tree.offset;
            delete tree.thread;
            TreeView.rg.cleanup(tree.left);
            TreeView.rg.cleanup(tree.right);
        }
    };

    return TreeView;

})();
