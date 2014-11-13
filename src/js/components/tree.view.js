S.TreeView = (function () {

    function TreeView(state, element) {
        S.View.call(this, state, element);
        this.elementMap = {};
        this.positionMap = {};
        this.labelMap = {};
        this.lastState = {};
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
            },
            autoScale: true,
            autoScaleOptions: {
                proportionalTo: 'height',
                scaleX: .1,
                scaleY: .15,
                nodeRadius: .05
            },
            offsetX: 0,
            offsetY: 0,
            scaleX: 75,
            scaleY: 50,
            nodeRadius: 32
        };
        if(this.state)
            this.render();
    }

    TreeView.prototype = Object.create(S.View.prototype);
    TreeView.prototype.constructor = TreeView;

    TreeView.prototype.autoScale = function (width, height) {
        var dimension = this.options.autoScaleOptions.proportionalTo == 'height' ? height : width;
        this.options.nodeRadius = this.options.autoScaleOptions.nodeRadius * dimension;
        this.options.offsetX = width / 2;
        this.options.offsetY = this.options.nodeRadius;
        this.options.scaleY = dimension * this.options.autoScaleOptions.scaleY;
        this.options.scaleX = dimension * this.options.autoScaleOptions.scaleX;
    };

    TreeView.prototype.render = function () {
        var self = this;
        this.clear();
        // http://stackoverflow.com/questions/20045532/snap-svg-cant-find-dynamically-and-successfully-appended-svg-element-with-jqu
        this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg = Snap(this._svg);
        this.svg.addClass(this.options.classes.svg);
        this.svg.attr({
            width: this.$element.width(),
            height: this.$element.height()
        });
        this.positionNodes();
        this._drawLines(this.state.root);
        this.allNodes(this.state.root, function (node) {
            var x = self.positionMap[node.id].x,
                y = self.positionMap[node.id].y;
            self.elementMap[node.id].node = self.drawNode(node, x, y);
            self.elementMap[node.id].value = self.drawValue(node.value, x, y);
            self.elementMap[node.id].height = self.drawHeight(node.height, x, y);
        });
        this.$element.append(this._svg);
    };

    TreeView.prototype.positionNodes = function () {
        var self = this,
            nodePosition;
        TreeView.rg(this.state.root);
        this.allNodes(this.state.root, function (node) {
            if(!self.positionMap[node.id])
                self.positionMap[node.id] = {};
            nodePosition = self.transformNodeCoordinates(node.x, node.y);
            self.positionMap[node.id].x = nodePosition.x;
            self.positionMap[node.id].y = nodePosition.y;
            self.positionMap[node.id].nodeSpaceX = node.x;
            self.positionMap[node.id].nodeSpaceY = node.y;
            delete node.x;
            delete node.y;
        });
    };

    /**
     * Transforms coordinates from node-space to actual space.
     * @param x
     * @param y
     * @returns {{x: number, y: number}}
     */
    TreeView.prototype.transformNodeCoordinates = function (x, y) {
        return {
            x: this.options.offsetX + x * this.options.scaleX,
            y: this.options.offsetY + y * this.options.scaleY
        };
    };

    TreeView.prototype.onResize = function () {
        if(this.options.autoScale)
            this.autoScale(this.$element.width(), this.$element.height());
        this.render();
    };

    TreeView.prototype.drawGridDots = function () {

    };

    TreeView.prototype._drawLines = function (tree) {
        var treeX = this.positionMap[tree.id].x,
            treeY = this.positionMap[tree.id].y;
        if (!this.elementMap[tree.id])
            this.elementMap[tree.id] = {};
        if (tree.left) {
            this.elementMap[tree.id].leftLine = this.drawLine(treeX, treeY, this.positionMap[tree.left.id].x, this.positionMap[tree.left.id].y);
            this._drawLines(tree.left);
        }
        if (tree.right) {
            this.elementMap[tree.id].rightLine = this.drawLine(treeX, treeY, this.positionMap[tree.right.id].x, this.positionMap[tree.right.id].y);
            this._drawLines(tree.right);
        }
    };

    TreeView.prototype.allNodes = function (tree, fn) {
        if (tree) {
            fn(tree);
            this.allNodes(tree.left, fn);
            this.allNodes(tree.right, fn);
        }
    };

    TreeView.prototype.drawLine = function (xi, yi, xf, yf) {
        return this.svg.line(xi, yi, xf, yf)
            .addClass(this.options.classes.line);
    };

    TreeView.prototype.drawNode = function (node, x, y) {
        return this.svg.circle(x, y, this.options.nodeRadius)
            .addClass(this.options.classes.node);
    };

    TreeView.prototype.drawNodeShadow = function (x, y, offsetX, offsetY) {
        return this.svg.circle(x + offsetX, y + offsetY, this.options.nodeRadius)
            .attr('fill', '#000000');
    };

    TreeView.prototype.drawValue = function (value, x, y) {
        // TODO get rid of magic numbers
        return this.svg.text(x, y + this.options.nodeRadius * .5, value + '')
            .addClass(this.options.classes.value)
            .attr('text-anchor', 'middle')
            .attr('font-size', this.options.nodeRadius * 1.25);
    };

    TreeView.prototype.drawHeight = function (height, nodeX, nodeY) {
        // TODO get rid of magic numbers
        return this.svg.text(nodeX - this.options.nodeRadius - this.options.nodeRadius * .85, nodeY + this.options.nodeRadius / 2 - 3, height + '')
            .attr('font-size', this.options.nodeRadius)
            .addClass(this.options.classes.height);
    };

    TreeView.prototype.drawLabel = function (node, label) {
        /*return this.svg.text(this.data(node).x + this.options.nodeRadius + 5, this.data(node).y + this.options.nodeRadius / 2 - 3, '/' + label)
            .addClass(this.options.classes.label)
            .attr('text-anchor', 'right')
            .attr('font-size', this.options.nodeRadius);*/
    };

    TreeView.prototype.add = function (parent, direction, value, fn) {
        //var parent = this.component.getNodeById(parent.id),
           // _ = this.view._;
        /*this.scale({
            width: _.width,
            height: _.height
        });*/
        //this.render();
        parent = this.component.getNodeById(parent.id); // TODO
        var addedNode = direction ? parent.right : parent.left;

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
        /*var view = this.view,
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
        }*/
    };

    TreeView.prototype.focus = function (node, fn) {
        console.log('Focusing');
        if (node) {
            this.elementMap[node.id].node.addClass('focus'); //this.view._.data(node).element.addClass('focus');
        }
        fn();
    };

    TreeView.prototype.unfocus = function (node, fn) {
        if (node) {
            this.elementMap[node.id].node.removeClass('focus'); //this.view._.data(node).element.addClass('focus');
        }
        fn();
    };

    TreeView.prototype.clearFocus = function (node, fn) {
        /*var view = this.view,
            _ = view._;
        view.allNodes(view.component.state, function (node) {
            _.data(node).element.removeClass('focus');
        });*/
    };

    TreeView.prototype.animateTravel = function (line, fn) {
        console.log('Animating travel!');
        line.addClass('tree-line-active');
        var orb = this.spawnTravelOrb(line);
        orb.animate({
            cx: line.attr('x2'),
            cy: line.attr('y2')
        }, 500, null, function () {
            orb.remove();
            line.removeClass('tree-line-active');
            fn();
        });
    };

    TreeView.prototype.spawnTravelOrb = function (line) {
        return this.svg.circle(line.attr('x1'), line.attr('y1'), 5)
            .addClass('tree-travelorb')
            .insertAfter(line);
    };

    TreeView.prototype.travel = function (parent, direction, fn) {
        console.log('travel: parent.id is %s', parent.id);
        console.dir(parent);
        console.dir(this.elementMap[parent.id]);
        if(direction && this.elementMap[parent.id].rightLine) {
            this.animateTravel(this.elementMap[parent.id].rightLine, fn);
        } else if (!direction && this.elementMap[parent.id].leftLine) {
            this.animateTravel(this.elementMap[parent.id].leftLine, fn);
        } else {
            console.log('Cannnot travel.');
           fn();
        }
/*
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
        }*/
    };

    TreeView.prototype.label = function (node, label, fn) {
        /*var _ = this.view._;
        if (node && _.data(node)) {
            _.data(node).label = label;
            _.data(node).s_label = this.view.drawLabel(node, label);
            fn();
        } else {
            fn();
        }*/
        fn();
    };

    TreeView.prototype.clearLabels = function (fn) {
        /*var view = this.view,
            _ = view._;
        view.allNodes(view.component.state, function (node) {
            _.data(node).s_label.remove();
        });*/
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
        /*console.info('display');
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
        });*/
    };

    function getSubtreeElements(root) {
        var ret = [],
            elements = [];
        if(root) {
            elements = this.elementMap[root.id];
            ret.push(elements.node);
            ret.push(elements.value);
            ret.push(elements.height);
            ret.push(elements.label);
            ret.push(elements.leftLine);
            ret.push(elements.rightLine);
            return ret.concat(getSubtreeElements(root.left).concat(getSubtreeElements(root.right)));
        }
    }

    /*function getTreeElements(root, data) {
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
    }*/

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
    };

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
