window.S = (function () {
    "use strict";
    var S = {};
    S.definitions = {};

    /**
     * Global definition function. Allows properties to be defined in any order.
     * @param obj
     * @param path
     */
    S.define = function (obj, path) {
        console.info('Defining %s', path);
        var nest = path.split('.'),
            last = S.definitions;
        nest.forEach(function (property) {
            if (!last[property]) {
                (last[property] = {}).value = null;
            }
            last = last[property];
        });
        last.value = obj;
    };

    S.get = function (path) {
        if (path.indexOf('undefined') > -1) return;
        var nest = path.split('.'),
            last = S.definitions;
        nest.forEach(function (property) {
            if (!last[property]) {
                (last[property] = {}).value = null;
            }
            last = last[property];
        });
        return last.value;
    };

    S.component = function (name, ctor) {
        if (ctor)
            S.defineComponent(name, ctor);
        else
            return S.instantiateComponent(name);
    };

    S.defineComponent = function (name, ctor) {
        S.define(ctor, 'components.' + name);
    };

    S.instantiateComponent = function (name) {
        return new S.get('components.' + name);
    }

    S.method = function (func, name, component) {
        var path = 'components.' + component + '.methods';
        if (!S.get(path))
            S.define([], path)
        S.get(path).push({
            name: name,
            func: func
        });
    };

    S.EventEmitter = function () {
        this.registeredEvents = {};
    }

    S.EventEmitter.prototype.on = function (eventName, fn) {
        if (!this.registeredEvents[eventName])
            this.registeredEvents[eventName] = [];
        this.registeredEvents[eventName].push(fn);
    };

    S.EventEmitter.prototype.fire = function (eventName, event) {
        if (!this.registeredEvents[eventName])
            return;
        for (var i = 0; i < this.registeredEvents[eventName].length; i++) {
            this.registeredEvents[eventName][i].call(event, event);
        }
    };

    /**
     * Shallow extend utility.
     */
    S.extend = function () {
        var args = Array.prototype.slice.call(arguments),
            ret = {};
        args.forEach(function (mixin) {
            for (var property in mixin) {
                if (!mixin.hasOwnProperty(property)) continue;
                ret[property] = mixin[property];
            }
        });
        return ret;
    };

    /**
     * Map utility.
     */
    S.map = function () {
        var values = {},
            keys = {},
            map = function (key, value) {
                if (typeof key.id === 'undefined')
                    throw new Error('S.map() requires id property');
                if (typeof value === 'undefined') {
                    if (!values[key.id])
                        values[key.id] = {};
                    return values[key.id];
                }
                values[key.id] = value;
                keys[key.id] = key;
            };

        map.clear = function () {
            values = {};
            keys = {};
        };

        map.delete = function (key) {
            if (!key.id)
                throw new Error('S.map() requires id property');
            delete values[key.id];
        };

        map.has = function (key) {
            if (!key.id)
                throw new Error('S.map() requires id property');
            return typeof values[key.id] !== 'undefined';
        }

        map.forEach = function (fn, thisArg) {
            if (!thisArg)
                thisArg = {};
            for (var id in values) {
                fn.call(thisArg, [keys[id], values[id]]);
            }
        }

        return map;
    };

    /**
     * setTimeout shorthand.
     */
    S.wait = function (func, time) {
        setTimeout(func, time);
    };

    return S;
})();


S.Component = function (state, view) {
    if (state) {
        this.state = state;
    }
    if (view) {
        this.view = view;
        this.view.state = this.state;
    }
};

S.Component.prototype = Object.create(S.EventEmitter.prototype);
S.Component.prototype.constructor = S.Component;

Object.defineProperty(S.Component.prototype, 'state', {
    get: function () {
        var val = this._state;
        if (this.onGetState)
            val = this.onGetState(val) || val;
        return val;
    },
    set: function (state) {
        var val = state;
        if (this.onSetState)
            val = this.onSetState(val) || val;
        this._state = val;
    }
});


S.View = function (state, element) {
    this.$element = element instanceof jQuery ? element : jQuery(element);
    this.state = state;
    this.interactive = true;
};

S.View.prototype = Object.create(S.EventEmitter.prototype);
S.View.prototype.constructor = S.View;

S.View.prototype.onResize = function () {

};

S.View.prototype.clear = function () {
    this.$element.empty();
};

S.View.prototype.enableInteractivity = function () {
    this.interactive = true;
};

S.View.prototype.disableInteractivity = function () {
    this.interactive = false;
};


S.AsyncFunctionQueue = (function () {

    /**
     * Constructs a new Asynchronous Function Queue. This is a list of functions that run asynchronous code,
     * such as animating elements on the page or making ajax requests. Each function should accept the callback
     * parameter as its final parameter, and call this callback to signal the completion of the function.
     * @constructor
     */
    function AsyncFunctionQueue() {
        this.functionList = []; // the array of functions.
        this.position = 0; // the current function to be executed.
        this.sleep = 10; // the time to wait between executing functions after `exec` is called.
        this.states = []; //
        this._open = false; // If true, auto execution is enabled.
        this.clearOnFinish = true; // If true, clears `functionList` once the last function is executed.
        this.executing = false; // True while executing.
    }

    /**
     * Pushes a function to the queue. If auto execution is enabled, the function is called.
     * @param fn This should accept a callback as its last parameter.
     */
    AsyncFunctionQueue.prototype.push = function (fn) {
        this.functionList.push(fn);
        if (this._open && !this.executing) {
            this.exec();
        }
    }

    /**
     * Stops execution, clears all functions, and sets `position` to 0.
     */
    AsyncFunctionQueue.prototype.clear = function () {
        this.executing = false;
        this.functionList = [];
        this.position = 0;

    }

    /**
     * Executes the next function and increments `position` on its completion.
     */
    AsyncFunctionQueue.prototype.next = function (fn) {
        var self = this;
        // TODO bind self as this?
        this.functionList[this.position].call(self, function () {
            self.position++;
            fn();
        });
    }

    /**
     * Begins executing all functions starting with the next function.
     */
    AsyncFunctionQueue.prototype.exec = function () {
        console.groupCollapsed('AsyncFunctionQueue executing');
        this.executing = true;
        var self = this;

        function iteration() {
            if (self.position >= self.functionList.length && self.clearOnFinish) {
                self.clear();
            }
            if (self.position >= self.functionList.length || !self.executing || !self.functionList[self.position]) {
                self.executing = false;
                console.groupEnd();
                return;
            }
            self.next(function () {
                setTimeout(iteration, self.sleep);
            });
        }

        iteration();
    }

    /**
     * Pauses execution.
     */
    AsyncFunctionQueue.prototype.pause = function () {
        this.executing = false;
    }

    /**
     * Enables auto execution. Functions are run as they are pushed.
     */
    AsyncFunctionQueue.prototype.open = function () {
        this._open = true;
        this.exec();
    }

    /**
     * Disables auto execution and stops current execution. Function "pile up".
     */
    AsyncFunctionQueue.prototype.close = function () {
        this._open = false;
        this.executing = false;
    }

    /**
     * Returns the number of functions on the queue.
     */
    Object.defineProperty(AsyncFunctionQueue.prototype, 'length', {
        get: function () {
            return this.functionList.length;
        }
    });

    /**
     * Returns the number of current position / the number of functions on the queue.
     */
    Object.defineProperty(AsyncFunctionQueue.prototype, 'completion', {
        get: function () {
            return this.position / this.functionList.length;
        }
    });

    return AsyncFunctionQueue;

})();






S.Deferred = (function () {

    var defaults = {

    };

    function Deferred(queue) {
        var self = this;
        S.EventEmitter.call(this);
        this.queue = queue;
        this.handle = {};
        this.handle.standard = function (key, value) {
            if (typeof value === 'undefined')
                return self.handle.standard._get(key);
            self.handle.standard._set(key, value);
        }
        this.include(std(), std(), {
            name: 'standard'
        });
    }

    Deferred.prototype = Object.create(S.EventEmitter.prototype);

    Deferred.prototype.include = function (component, copy, options) {
        var options = S.extend(defaults, options),
            _interface = this.handle[options.name || component] ? this.handle[options.name || component] : this.handle[options.name || component] = {},
            self = this,
            definedMethods = S.get('components.' + component.alias + '.methods');
        for (var property in component) {
            if (typeof component[property] !== 'function' || !component[property].live)
                continue;
            _interface[property] = (function (property) {
                var method = function () {
                    var args = Array.prototype.slice.call(arguments);
                    self.queue.push(function (fn) {
                        component[property].apply(component, args.concat(fn));
                    });
                    return copy[property].apply(copy, args);
                };
                return method;
            })(property);
        }
        if (!definedMethods || definedMethods.length == 0) return;
        definedMethods.forEach(function (definedMethod) {
            if (!_interface[definedMethod.name]) {
                _interface[definedMethod.name] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(_interface);
                    definedMethod.func.apply(self.handle.standard, args);
                };
            }
        });
    };

    function std() {
        var standard = {},
            vars = {};
        standard.flog = function (str, fn) {
            console.log(str);
            if (fn) fn();
        };
        standard.flog.live = true;
        standard.fwarn = function (str, fn) {
            console.warn(str);
            if (fn) fn();
        };
        standard.fwarn.live = true;
        standard._set = function (key, value, fn) {
            vars[key] = value;
            if (fn) fn();
        };
        standard._set.live = true;
        standard._get = function (key, fn) {
            if (fn) fn();
            return vars[key];
        };
        standard._get.live = true;
        standard.comment = function (str) {
            // TODO
        };
        standard.comment.live = true;
        return standard;
    };

    return Deferred;
})();

S.Array = (function () {

    function Array(state, view) {
        this.alias = 'array';
        S.Component.call(this, state, view);
    }

    Array.prototype = Object.create(S.Component.prototype);
    Array.prototype.constructor = Array;

    Array.prototype.onSetState = function (state) {
        var returnState = {};
        returnState.array = [].concat(state.array);
        console.log('array.onSetState state.array is ');
        console.dir(returnState.array);
        returnState.flags = [];
        return returnState;
    }

    Array.prototype.onGetState = function (state) {
        return state;
    }

    Array.prototype.getLength = function (next) {
        console.log('getLength length is %s', this.state.array.length);
        console.dir(this.state.array);
        if (this.view)
            next(this.state.array.length);
        else
            return this.state.array.length;
    };
    Array.prototype.getLength.live = true;

    Array.prototype.flag = function (index, next) {
        this.state.flags[index] = true;
        if (this.view)
            this.view.flag(index, next);
    };
    Array.prototype.flag.live = true;

    Array.prototype.flagged = function (index, next) {
        /*if (this.view)
            next(this.state.length);
        else
            return this.state.flags[index];*/
    };
    Array.prototype.flagged.true;

    Array.prototype.setItem = function (index, value, next) {
        this.state.array[index] = value;
        if (this.view)
            this.view.setItem(index, value, next);
    };
    Array.prototype.setItem.live = true;

    Array.prototype.getItem = function (index, next) {
        if (this.view)
            next(this.state.array[index]);
        else
            return this.state.array[index];
    };
    Array.prototype.getItem.live = true;

    Array.prototype.push = function (item, next) {
        this.state.array.push(item);
        if (this.view)
            this.view.push(item, next);
    };
    Array.prototype.push.live = true;

    Array.prototype.focus = function (index, next) {
        if (this.view) this.view.focus(index, next);
    };
    Array.prototype.focus.live = true;

    Array.prototype.range = function (start, end, num, next) {
        if (this.view) this.view.range(start, end, num, next);
    };
    Array.prototype.range.live = true;

    Array.prototype.clearfocus = function (next) {
        if (this.view) this.view.clearfocus(next);
    };
    Array.prototype.clearfocus.live = true;

    Array.prototype.clearrange = function (num, next) {
        if (this.view) this.view.clearrange(num, next);
    };
    Array.prototype.clearrange.live = true;

    Array.prototype.leftTo = function (index, next) {
        if (this.view) this.view.leftTo(index, next);
    };
    Array.prototype.leftTo.live = true;


    return Array;

})();

S.ArrayView = (function () {

    function ArrayView(state, element) {
        S.View.call(this, state, element);
        this.options = {
            hiddenDelimiter: ',',
            numElements: 5,
            pageTime: 300,
            stepTime: 50,
            scrollTime: 500,
            maxScrollTime: 1000
        };
        this.leftBound = 0;
        this.rightBound = this.options.numElements - 1;
        this.$e = null;
        this.$table = null;
        this.$topRow = null;
        this.$bottomRow = null;
        this.$cells = $();
        this.$indices = $();
        this.computedWidth = null;
        this.width = null;
        this.border = 0;
        this.computedCellWidth = null;
        this.height = null;
        this.$e = $('<div class="array"></div>');
        this.scaleTo({
            width: this.$element.width(),
            height: this.$element.height()
        });
        if (this.state)
            this.render();
    }

    ArrayView.prototype = Object.create(S.View.prototype);
    ArrayView.prototype.constructor = ArrayView;

    ArrayView.prototype.scaleTo = function (dimensions) {
        this.width = dimensions.width;
        this.height = dimensions.height;
        this.$e.css('width', dimensions.width);
        this.$e.css('height', dimensions.height);
        this.computedCellWidth = Math.floor(this.width / this.options.numElements) - this.border;
    };

    ArrayView.prototype.render = function () {
        this.clear();
        this.$cells = $();
        this.$indices = $();
        this.$table = $('<table></table>').addClass('array-table');
        this.$topRow = $('<tr></tr>').addClass('array-top');
        this.$bottomRow = $('<tr></tr>').addClass('array-bottom');
        this.$e.append(this.$table);
        this.$table.append(this.$topRow).append(this.$bottomRow);

        this.$table.css({
            height: this.height
        });

        this.$topRow.css({
            fontSize: Math.round(this.$table.height() * .25)
        });

        for (var i = 0; i < this.state.array.length; i++) {
            var $td = $('<td>' + this.state.array[i] + '<span style="font-size: 0;">' + this.options.hiddenDelimiter + '</span></td>'),
                $th = $('<th>' + i + '</th>');
            $td.data('index', i);
            $th.data('index', i);
            $td.width(this.computedCellWidth);
            $th.width(this.computedCellWidth);
            $td.addClass('array-cell');
            $th.addClass('array-index');
            this.$topRow.append($td);
            this.$bottomRow.append($th);
            this.$cells = this.$cells.add($td);
            this.$indices = this.$indices.add($th);
        }

        this.computedWidth = this.computedCellWidth + this.border;
        this.width = this.options.numElements * this.computedWidth + this.border;
        this.$e.css('width', this.width); // TODO
        this.$element.append(this.$e);
        this.bindEvents(this.$cells, this.$indices);
    };

    ArrayView.prototype.bindEvents = function ($cells, $_indices) {
        //$e.mousewheel(handleMousewheel); // TODO needs mousewheel
        var self = this;
        this.$cells.click(function (e) {
            if (!self.interactive) return;
            self.focus($(this).data('index'));
        });
        this.$cells.dblclick(function (e) {
            if (!self.interactive) return;
            if ($(this).hasClass('array-flagged'))
                $(this).removeClass('array-flagged');
            else
                $(this).addClass('array-flagged');
        });
    };
    ArrayView.prototype.focus = function (index, fn) {
        if (index < 0 || index > this.state.array.length - 1)
            return;
        this.$cells.removeClass('focus');
        this.$indices.removeClass('focus');
        this.$cells.eq(index).addClass('focus');
        this.$indices.eq(index).addClass('focus');
        var idx = index - Math.floor(this.options.numElements / 2);
        this.leftTo(idx, fn);
    };
    ArrayView.prototype.focus.live = true;

    ArrayView.prototype.clearfocus = function (fn) {
        this.$cells.removeClass('focus');
        this.$indices.removeClass('focus');
        fn();
    }
    ArrayView.prototype.clearfocus.live = true;

    ArrayView.prototype.flag = function (index, fn) {
        this.$cells.eq(index).addClass('array-flagged');
        if (fn) fn();
    }
    ArrayView.prototype.flag.live = true;

    ArrayView.prototype.range = function (start, end, num, fn) {
        var $range = this.$cells.slice(start, end + 1),
            clazz = 'range' + num;
        // TODO why do I do this? -v
        $range.addClass(function (i) {
            var classes = $range.eq(i).attr('class'),
                newClass = clazz + ' ' + classes;
            $range.eq(i).attr('class', newClass);
        });
        fn();
    };
    ArrayView.prototype.range.live = true;

    ArrayView.prototype.clearrange = function (num, fn) {
        this.$cells.removeClass('range' + num);
        fn();
    };
    ArrayView.prototype.clearrange.live = true;

    ArrayView.prototype.setItem = function (index, item, fn) {
        var self = this;
        this.focus(index, function () {
            S.wait(function () {
                self.$cells.eq(index).addClass('array-remove');
                S.wait(function () {
                    self.$cells.eq(index).text(item);
                    self.$cells.eq(index).removeClass('array-remove');
                    fn();
                }, 300);
            }, 200);
        });
    };
    ArrayView.prototype.setItem.live = true;

    ArrayView.prototype.push = function (item, fn) {
        var $added = this.addItem(item, this.state.array.length - 1);
        this.leftTo(this.state.array.length - 1, function () {
            $added.animate({
                opacity: 1
            }, 200, function () {
                fn();
            });
        });
    };
    ArrayView.prototype.push.live = true;

    ArrayView.prototype.addItem = function (item, index) {
        var $newTd = $('<td>' + item + '</td>'),
            $newTh = $('<th>' + index + '</th>');
        var $both = $newTd.add($newTh).css({
            opacity: 0,
            width: this.computedCellWidth
        });
        $newTd.addClass('array-cell');
        $newTh.addClass('array-index');
        $both.data('index', index);
        this.$topRow.append($newTd);
        this.$bottomRow.append($newTh);
        this.$cells = this.$cells.add($newTd);
        this.$indices = this.$indices.add($newTh);
        this.bindEvents($newTd, $newTh);
        return $both;
    };

    ArrayView.prototype.leftTo = function (index, fn) {
        index = parseInt(index, 10);
        if (isNaN(index))
            return;
        if (index <= 0)
            index = 0;
        if (index >= this.state.array.length - 1)
            index = this.state.array.length - 1;
        var time = Math.min(Math.abs(index - this.leftBound) * this.options.stepTime, this.options.maxScrollTime);
        if (index == 0) {
            this.leftBound = 0;
            this.rightBound = this.options.numElements - 1;
        } else if (index > this.state.array.length - this.options.numElements) {
            this.leftBound = this.state.array.length - this.options.numElements;
            this.rightBound = this.state.array.length - 1;
        } else {
            this.leftBound = index;
            this.rightBound = index + this.options.numElements - 1;
        }
        this.scrollTo(index * this.computedWidth, time, fn);
    }

    ArrayView.prototype.rightTo = function (index) {
        index = parseInt(index, 10);
        if (isNan(index))
            return;
        if (index <= 0)
            index = 0;
        if (index >= this.state.array.length - 1)
            index = this.state.array.length - 1;
        var time = Math.min(Math.abs(index - this.leftBound) * this.options.stepTime, this.options.maxScrollTime);
        if (index <= this.options.numElements - 1) {
            this.leftBound = 0;
            this.rightBound = this.options.numElements - 1;
        } else if (index == this.state.array.length - 1) {
            this.leftBound = this.state.array.length - this.options.numElements;
            this.rightBound = this.state.array.length - 1;
        } else {
            this.leftBound = index - this.options.numElements + 1;
            this.rightBound = index;
        }
        scrollTo(index * this.computedWidth, time);
    }

    ArrayView.prototype.pageRight = function () {
        this.leftBound = this.leftBound + this.options.numElements <= this.state.array.length - this.options.numElements ? this.leftBound + this.options.numElements : this.state.array.length - this.options.numElements;
        this.rightBound = this.rightBound + this.options.numElements <= this.state.array.length - 1 ? this.rightBound + this.options.numElements : this.state.array.length - 1;
        page(true);
    }

    ArrayView.prototype.pageLeft = function () {
        this.leftBound = this.leftBound - this.options.numElements >= 0 ? this.leftBound - this.options.numElements : 0;
        this.rightBound = this.rightBound - this.options.numElements >= this.options.numElements - 1 ? this.rightBound - this.options.numElements : this.options.numElements - 1;
        page(false);
    }

    ArrayView.prototype.right = function () {
        this.leftBound = this.leftBound + 1 <= this.state.array.length - this.options.numElements ? this.leftBound + 1 : this.state.array.length - this.options.numElements;
        this.rightBound = this.rightBound + 1 <= this.state.array.length - 1 ? this.rightBound + 1 : this.state.array.length - 1;
        this.step(true);
    }

    ArrayView.prototype.left = function () {
        this.leftBound = this.leftBound - 1 >= 0 ? this.leftBound - 1 : 0;
        this.rightBound = this.rightBound - 1 >= this.options.numElements - 1 ? this.rightBound - 1 : this.options.numElements - 1;
        this.step(false);
    }

    ArrayView.prototype.page = function (right) {
        this.scroll(right, this.options.pageTime, this.width - 1);
    }

    ArrayView.prototype.step = function (right) {
        this.scroll(right, this.options.stepTime, this.computedWidth);
    }

    ArrayView.prototype.scroll = function (right, time, amount) {
        var str = '+=';
        if (!right) str = '-=';
        var anim = {};
        anim.scrollLeft = str + amount;
        this.$e.animate(anim, time);
        //this.fire('change', {});
    };

    ArrayView.prototype.scrollTo = function (amount, time, fn) {
        this.$e.animate({
            scrollLeft: amount
        }, time, function () {
            if (typeof fn !== 'undefined')
                fn();
        });
    };

    return ArrayView;
})();


S.Tree = (function () {

    function Tree(state, view) {
        this.alias = 'tree';
        this.nodes = {};
        S.Component.call(this, state, view);
    }

    Tree.prototype = Object.create(S.Component.prototype);
    Tree.prototype.constructor = Tree;

    Tree.Node = function (value, id, left, right) {
        this.value = value;
        this.id = id;
        this.left = left;
        this.right = right;
    };

    Tree.prototype.onSetState = function (state) {
        var returnState = {};
        returnState.nextId = state.nextId || 0;
        returnState.root = this.copyTree(state.root, null);
        this.setNodeIds(returnState.root, returnState);
        this.computeHeights(returnState.root);
        return returnState;
    };

    Tree.prototype.onGetState = function (state) {
        return state;
    };

    Tree.prototype.root = function (next) {
        if (this.view)
            next(this.state.root);
        else
            return this.state.root;
    };
    Tree.prototype.root.live = true;

    Tree.prototype.add = function (parent, direction, value, next) {
        parent = this.getNodeById(parent);
        var added;
        if (direction) {
            if (parent.right) return;
            added = parent.right = new Tree.Node(value, this.getNextNodeId(), null, null);
        } else {
            if (parent.left) return;
            added = parent.left = new Tree.Node(value, this.getNextNodeId(), null, null);
        }
        this.nodes[added.id] = added;
        this.computeHeights(this.state);
        if (this.view)
            this.view.add(parent, direction, value, function () {
                next(added);
            });
        else
            return added;
    };
    Tree.prototype.add.live = true;

    Tree.prototype.remove = function (node, next) {
        node = this.getNodeById(node);
        var parent = node.parent;
        if (node.parent && node.parent.left == node) {
            node.parent.left = null;
        } else if (node.parent && node.parent.right == node) {
            node.parent.right = null;
        }
        this.computeHeights(this.state);
        if (this.view)
            this.view.remove(node, next);
    };
    Tree.prototype.remove.live = true;

    Tree.prototype.set = function (node, value, next) {
        node = this.getNodeById(node);
        node.value = value;
        if (this.view)
            this.view.set(node, value, function () {
                next(node);
            });
        else
            return node;
    };
    Tree.prototype.set.live = true;

    Tree.prototype.get = function (node, next) {
        node = this.getNodeById(node);
        if (this.view)
            next(node.value);
        else
            return node.value;
    };
    Tree.prototype.get.live = true;

    Tree.prototype.height = function (next) {
        if (this.view)
            next(this.computeHeights(this._state));
        return this.computeHeights(this._state);
    };
    Tree.prototype.height.live = true;

    Tree.prototype.mark = function (next) {
        if (this.view) this.view.mark(next);
    };
    Tree.prototype.mark.live = true;

    Tree.prototype.markPath = function (next) {
        if (this.view) this.view.markPath(next);
    };
    Tree.prototype.markPath.live = true;

    Tree.prototype.clearPath = function (next) {
        if (this.view) this.view.clearPath(next);
    };
    Tree.prototype.clearPath.live = true;

    Tree.prototype.clearLabels = function (next) {
        if (this.view) this.view.clearLabels(next);
    };
    Tree.prototype.clearLabels.live = true;

    Tree.prototype.travel = function (parent, direction, next) {
        console.log('Travelling!');
        if (this.view) this.view.travel(parent, direction, next);
    };
    Tree.prototype.travel.live = true;

    Tree.prototype.label = function (node, label, next) {
        if (this.view) this.view.label(node, label, next);
    };
    Tree.prototype.label.live = true;

    Tree.prototype.focus = function (node, next) {
        if (this.view) this.view.focus(node, next);
    };
    Tree.prototype.focus.live = true;

    Tree.prototype.unfocus = function (node, next) {
        if (this.view) this.view.unfocus(node, next);
    };
    Tree.prototype.unfocus.live = true;

    Tree.prototype.clearFocus = function (node, next) {
        if (this.view) this.view.clearFocus(node, next);
    };
    Tree.prototype.clearFocus.live = true;

    Tree.prototype.display = function (options, next) {
        if (this.view) this.view.display(options, next);
    };
    Tree.prototype.display.live = true;

    Tree.prototype.allNodes = function (tree, fn) {
        if (tree) {
            fn(tree);
            this.allNodes(tree.left, fn);
            this.allNodes(tree.right, fn);
        }
    };

    Tree.prototype.copyTree = function (targetNode, parent) {
        var node = null;
        if (targetNode) {
            node = new Tree.Node(targetNode.value, targetNode.id, null, null);
            node.parent = parent;
            node.left = this.copyTree(targetNode.left, node);
            node.right = this.copyTree(targetNode.right, node);
            this.nodes[node.id] = node;
        }
        return node;
    };

    Tree.prototype.getNodeById = function (idOrObject) {
        var id = typeof idOrObject === 'object' ? idOrObject.id : idOrObject;
        return this.nodes[id];
    };

    Tree.prototype.setNodeById = function (id, node) {
        this.nodes[node.id] = node;
    };

    Tree.prototype.computeHeights = function (root) {
        if (root)
            return root.height = 1 + Math.max(this.computeHeights(root.left), this.computeHeights(root.right));
        return -1;
    };

    Tree.prototype.setNodeIds = function (root, state) {
        if (root) {
            if (typeof root.id === 'undefined')
                root.id = this.getNextNodeId(state);
            this.setNodeIds(root.left, state);
            this.setNodeIds(root.right, state);
        }
    }

    Tree.prototype.getNextNodeId = function (state) {
        return state.nextId++;
    };

    return Tree;

})();


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
        if (this.state)
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
            if (!self.positionMap[node.id])
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
        if (this.options.autoScale)
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
        if (direction && this.elementMap[parent.id].rightLine) {
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
        if (root) {
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
    TreeView.rg = function (tree) {
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
        if (!root) {
            extremes.lmost.level = -1;
            extremes.rmost.level = -1;
            return;
        }
        root.y = level;
        leftContourNode = root.left;
        rightContourNode = root.right;
        TreeView.rg.position(leftContourNode, level + 1, leftExtremes, options); // recurse on left subtree
        TreeView.rg.position(rightContourNode, level + 1, rightExtremes, options); // recurse on right subtree
        if (!root.left && !root.right) {
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
        while (leftContourNode && rightContourNode) {

            if (currentSeparation < options.minimumSeparation) {
                rootSeparation += (options.minimumSeparation - currentSeparation); // (minimumSeparation - currentSeparation) is the amount we have moved the nodes apart.
                currentSeparation = options.minimumSeparation;
            }

            // since threading is done on left and right properties, we don't worry if things have been threaded here
            if (leftContourNode.right) {
                leftOffset += leftContourNode.offset;
                currentSeparation -= leftContourNode.offset;
                leftContourNode = leftContourNode.right;
            } else {
                leftOffset -= leftContourNode.offset;
                currentSeparation += leftContourNode.offset;
                leftContourNode = leftContourNode.left;
            }
            if (rightContourNode.left) {
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
        if (!root.left || rightExtremes.lmost.level > leftExtremes.lmost.level) {
            extremes.lmost = rightExtremes.lmost;
            extremes.lmost.offset += root.offset;
        } else {
            extremes.lmost = leftExtremes.lmost;
            extremes.lmost.offset -= root.offset;
        }
        // set rmost
        if (!root.right || leftExtremes.rmost.level > rightExtremes.rmost.level) {
            extremes.rmost = leftExtremes.rmost;
            extremes.rmost.offset -= root.offset;
        } else {
            extremes.rmost = rightExtremes.rmost;
            extremes.rmost.offset += root.offset;
        }

        // threading for next recursion only if subtrees are different heights and nonempty
        // at most only one thread has to be inserted

        if (leftContourNode && leftContourNode !== root.left) {
            rightExtremes.rmost.node.thread = true;
            rightExtremes.rmost.node.offset = Math.abs(rightExtremes.rmost.offset + root.offset - leftOffset);
            if (leftOffset - root.offset <= rightExtremes.rmost.offset)
                rightExtremes.rmost.node.left = leftContourNode;
            else
                rightExtremes.rmost.node.right = leftContourNode;
        } else if (rightContourNode && rightContourNode !== root.right) {
            leftExtremes.lmost.node.thread = true;
            leftExtremes.lmost.node.offset = Math.abs(leftExtremes.lmost.offset - root.offset - rightOffset);
            if (rightOffset + root.offset >= leftExtremes.lmost.offset)
                leftExtremes.lmost.node.right = rightContourNode;
            else
                leftExtremes.lmost.node.left = rightContourNode;
        }

    };

    TreeView.rg.absolute = function (tree, x) {
        if (tree) {
            tree.x = x;
            if (tree.thread) {
                tree.thread = false;
                tree.left = null; // threaded node must have been a leaf
                tree.right = null;
            }
            TreeView.rg.absolute(tree.left, x - tree.offset);
            TreeView.rg.absolute(tree.right, x + tree.offset);
        }
    };

    TreeView.rg.cleanup = function (tree) {
        if (tree) {
            delete tree.offset;
            delete tree.thread;
            TreeView.rg.cleanup(tree.left);
            TreeView.rg.cleanup(tree.right);
        }
    };

    return TreeView;

})();


S.Heap = (function () {

    function Heap(state, view) {
        // assuming state is a valid heap
        this.alias = 'heap';
        this.nodesByIndex = [];
        this.tree = new S.Tree(this.makeTree(state, null, 0), view ? view.treeView : null);
        this.array = new S.Array(state, view ? view.arrayView : null);
        S.Component.call(this, state, view);
    }

    Heap.prototype = Object.create(S.Component.prototype);
    Heap.prototype.constructor = Heap;

    Heap.prototype.push = function (value, next) {
        var oneFinished = false;
        this.array.push(value, function () {
            if (oneFinished)
                next();
            else
                oneFinished = true;
        });
        var index = this.array.state.length - 1;
        this.tree.add(this.getNodeByIndex(this.getParentIndex(index)),
            getAvailableDirection(index), value, function () {
                if (oneFinished)
                    next();
                else
                    oneFinished = true;
            });
    };
    Heap.prototype.push.live = true;

    Heap.prototype.makeTree = function (array, parent, index) {
        if (index > array.length - 1)
            return null;
        // TODO don't pass in index for id, pass in id
        var node = new S.Tree.Node(array[index], index, null, null);
        node.left = this.makeTree(array, node, (index + 1) * 2 - 1);
        node.right = this.makeTree(array, node, (index + 1) * 2);
        node.parent = parent;
        this.nodesByIndex[index] = node;
        return node;
    };

    Heap.prototype.getParentIndex = function (index) {
        return Math.floor((index + 1) / 2) - 1;
    }

    Heap.prototype.getAvailableDirection = function (index) {
        if (index % 2 == 0)
            return true;
        return false;
    };

    Heap.prototype.getNodeByIndex = function (index) {
        return this.nodesByIndex[index];
    };

    Heap.prototype.getLength = function (fn) {
        //this.array.getLength(fn);
        if (this.array.view)
            this.array.getLength(fn);
        else
            return this.array.getLength();
    };

    Heap.prototype.getLength.live = true;


    Heap.prototype.focus = function (index, next) {
        var oneFinished = false;
        this.tree.focus(this.getNodeByIndex(index), function () {
            if (oneFinished)
                next();
            else
                oneFinished = true;
        });
        this.array.focus(index, function () {
            if (oneFinished)
                next();
            else
                oneFinished = true;
        });
    };

    Heap.prototype.focus.live = true;


    return Heap;

})();


S.HeapView = (function () {

    function HeapView(element) {
        S.View.call(this, element);
        this.$element.append($('<div class="heap-tree" style="height: 75%;"></div>'));
        this.$element.append($('<div class="heap-array" style="height: 25%;"></div>'));
        this.treeElement = this.$element.find('.heap-tree');
        this.arrayElement = this.$element.find('.heap-array');
        this.treeView = new S.TreeView(this.treeElement);
        this.arrayView = new S.ArrayView(this.arrayElement);
    };

    HeapView.prototype = Object.create(S.View.prototype);
    HeapView.prototype.constructor = HeapView;

    HeapView.prototype.init = function () {

    };

    return HeapView;

})();

/*S.method('array', 'searchLinear', function (target) {
    for (var i = 0; i < this.getLength(); i++) {
        this.focus(i);
        if (this.getItem(i) == target) {
            this.flag(i);
            return;
        }
    }
    this.finish();
});

S.method('array', 'searchBinary', function (target) {

    if (!this.isSorted()) {
        this.warn('Array is not sorted. Binary search will not behave correctly.');
    }

    function search(left, right) {
        if (right < left) {
            this.clearrange(1);
            this.finish();
            return;
        }
        this.clearrange(1);
        this.range(left, right, 1);
        var mid = Math.floor((left + right) / 2);
        this.focus(mid);
        if (target < this.getItem(mid)) {
            search.call(this, left, mid - 1);
        } else if (target > this.getItem(mid)) {
            search.call(this, mid + 1, right);
        } else {
            this.focus(mid);
            this.flag(mid);
            return;
        }
    }

    search.call(this, 0, this.getLength());

});
*/

S.method(function (array) {
    for (var i = 0; i < array.getLength(); i++) {
        this('j', i);
        while (this('j') > 0 && array.getItem(this('j') - 1) > array.getItem(this('j'))) {
            this('temp', array.getItem(this('j')));
            array.setItem(this('j'), array.getItem(this('j') - 1));
            array.setItem(this('j') - 1, this('temp'));
            this('swapped', true);
            this('j', this('j') - 1);
        }
        array.range(0, i, 1); //show sorted portion of array
    }
    array.clearrange(1);
    //this.finish();
}, 'insertionSort', 'array');

/*S.method('array', 'bubbleSort', function () {
    this('swap', true);
    while (this.is('swap', true)) {
        this('swap', false);
        for (var i = 0; i < this.getLength() - 1; i++) {
            this.focus(i);
            if (this.getItem(i) > this.getItem(i + 1)) {
                // swap
                this.range(i, i + 1, 2);
                /*this('temp', this.getItem(i));
                 this.setItem(i, this.getItem(i + 1));
                 this.setItem(i + 1, this('temp'));*/
/*this.swap(i, i + 1);
                this('swap', true);
                this.clearrange(2);
            }
        }
    }
    this.finish();
});

S.method('array', 'quickSort', function () {
    // TODO
});*/

S.method(function traversal(tree, kind) {

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
