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

    /*S.modifier = function(component, func) {
     S.define('components.' + component + '.modifiers')
     }*/

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

    S.components = function (name) {
        if (typeof S.get('components.' + name) === 'function') {

        }
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

    return S;
})();

S.config = {
    provideDefaultDeferredContext: true,
    /* Provide a deferred context on newly created components. */
    viewClass: 'structural_view' /* CSS class for views */
};

var id = 0;

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
}

S.nextId = function () {
    return 'sid_' + id++;
}

S.map = function () {
    var values = {},
        keys = {},
        map = function (key, value) {
            if (!key.sid)
                throw new Error('S.map() requires sid property. Use S.nextId().');
            if (typeof value === 'undefined') {
                if (!values[key.sid])
                    values[key.sid] = {};
                return values[key.sid];
            }
            values[key.sid] = value;
            keys[key.sid] = key;
        };

    map.clear = function () {
        values = {};
        keys = {};
    };

    map.delete = function (key) {
        if (!key.sid)
            throw new Error('S.map() requires sid property. Use S.nextId().');
        delete values[key.sid];
    };

    map.has = function (key) {
        if (!key.sid)
            throw new Error('S.map() requires sid property. Use S.nextId().');
        return typeof values[key.sid] !== 'undefined';
    }

    map.forEach = function (fn, thisArg) {
        if (!thisArg)
            thisArg = {};
        for (var sid in values) {
            fn.call(thisArg, [keys[sid], values[sid]]);
        }
    }

    return map;
}

S.wait = function (func, time) {
    setTimeout(func, time);
}

S.Component = function (state, view) {
    console.info('Component constructor');
    if (state)
        this.state = state;
    if (view)
        this.view = view;
};

S.Component.prototype = Object.create(S.EventEmitter.prototype);

Object.defineProperty(S.Component.prototype, 'state', {
    get: function () {
        var ret;
        if (this.prepareState)
            ret = this.prepareState(this._state) || this._state;
        return ret;
    },
    set: function (state) {
        var toSet;
        if (this.handleState)
            toSet = this.handleState(state) || state;
        this._state = toSet;
    }
});

Object.defineProperty(S.Component.prototype, 'view', {
    get: function () {
        return this._view;
    },
    set: function (view) {
        this._view = view;
        view.component = this;
        view.init();
    }
});

/**
 * Convenience method. Makes all properties set to null on this.live view-only methods.
 */
// TODO
S.Component.prototype.makeViewOnly = function () {
    for (var property in this.live) {
        if (this.live.hasOwnProperty(property) && property === null) {
            this.live[property] = (function (property) {
                var fn = function () {
                    this.view.live[property].apply(this.view.live, Array.prototype.slice.call(arguments));
                };
            })(property);
        }
    }
};

S.Component.prototype.bindLive = function () {
    console.info('bindLive');
    for (var property in this.live) {
        if (!this.live.hasOwnProperty(property) || typeof this.live[property] !== 'function')
            continue;
        this.live[property].bind(this);
    }
};

S.Component.prototype.init = function () {
    // this.makeViewOnly(); // TODO
    // this.bindLive(); // TODO
}

S.View = function (element) {
    this.$element = element instanceof jQuery ? element : jQuery(element);
    this.interactive = true;
};

S.View.prototype = Object.create(S.EventEmitter.prototype);

S.View.prototype.clear = function () {
    this.$element.empty();
};

S.View.prototype.enableInteractivity = function () {
    this.interactive = true;
};

S.View.prototype.disableInteractivity = function () {
    this.interactive = false;
}


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
        this.sleep = 100; // the time to wait between executing functions after `exec` is called.
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
                    definedMethod.func.call(self.standard, _interface);
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
    }

    return Deferred;
})();

S.Array = (function () {

    function Array(state, view) {
        this.alias = 'array';
        S.Component.call(this, [].concat(state), view);
        this.state.flags = [];
    }

    Array.prototype = Object.create(S.Component.prototype);
    Array.prototype.constructor = Array;

    Array.prototype.getLength = function (next) {
        if (this.view)
            next(this.state.length);
        else
            return this.state.length;
    };
    Array.prototype.getLength.live = true;

    Array.prototype.flag = function (index, next) {
        this.state.flags[index] = true;
        if (this.view)
            this.view.flag(index, next);
    };
    Array.prototype.flag.live = true;

    Array.prototype.flagged = function (index, next) {
        if (this.view)
            next(this.state.length);
        else
            return this.state.flags[index];
    };
    Array.prototype.flagged.true;

    Array.prototype.setItem = function (index, value, next) {
        this.state[index] = value;
        if (this.view)
            this.view.setItem(index, value, next);
    };
    Array.prototype.setItem.live = true;

    Array.prototype.getItem = function (index, next) {
        if (this.view)
            next(this.state[index]);
        else
            return this.state[index];
    };
    Array.prototype.getItem.live = true;

    Array.prototype.push = function (item, next) {
        this.state.push(item);
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
    function ArrayView(element) {
        S.View.call(this, element);
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
    }

    ArrayView.prototype = Object.create(S.View.prototype);
    ArrayView.prototype.constructor = ArrayView;

    ArrayView.prototype.init = function () {
        this.$e = $('<div class="array"></div>');
        this.scaleTo({
            width: this.$element.width(),
            height: this.$element.height()
        });
    };

    ArrayView.prototype.scaleTo = function (dimensions) {
        this.width = dimensions.width;
        this.height = dimensions.height;
        this.$e.css('width', dimensions.width);
        this.$e.css('height', dimensions.height);
        this.computedCellWidth = Math.floor(this.width / this.options.numElements) - this.border;
        this.render();
    }

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

        for (var i = 0; i < this.component.state.length; i++) {
            var $td = $('<td>' + this.component.state[i] + '<span style="font-size: 0;">' + this.options.hiddenDelimiter + '</span></td>'),
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
            console.log('handleTdClick');
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
        if (index < 0 || index > this.component.state.length - 1)
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
        var $added = this.addItem(item, this.component.state.length - 1);
        this.leftTo(this.component.state.length - 1, function () {
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
        if (index >= this.component.state.length - 1)
            index = this.component.state.length - 1;
        var time = Math.min(Math.abs(index - this.leftBound) * this.options.stepTime, this.options.maxScrollTime);
        if (index == 0) {
            this.leftBound = 0;
            this.rightBound = this.options.numElements - 1;
        } else if (index > this.component.state.length - this.options.numElements) {
            this.leftBound = this.component.state.length - this.options.numElements;
            this.rightBound = this.component.state.length - 1;
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
        if (index >= this.component.state.length - 1)
            index = this.component.state.length - 1;
        var time = Math.min(Math.abs(index - this.leftBound) * this.options.stepTime, this.options.maxScrollTime);
        if (index <= this.options.numElements - 1) {
            this.leftBound = 0;
            this.rightBound = this.options.numElements - 1;
        } else if (index == this.component.state.length - 1) {
            this.leftBound = this.component.state.length - this.options.numElements;
            this.rightBound = this.component.state.length - 1;
        } else {
            this.leftBound = index - this.options.numElements + 1;
            this.rightBound = index;
        }
        scrollTo(index * this.computedWidth, time);
    }

    ArrayView.prototype.pageRight = function () {
        this.leftBound = this.leftBound + this.options.numElements <= this.component.state.length - this.options.numElements ? this.leftBound + this.options.numElements : this.component.state.length - this.options.numElements;
        this.rightBound = this.rightBound + this.options.numElements <= this.component.state.length - 1 ? this.rightBound + this.options.numElements : this.component.state.length - 1;
        page(true);
    }

    ArrayView.prototype.pageLeft = function () {
        this.leftBound = this.leftBound - this.options.numElements >= 0 ? this.leftBound - this.options.numElements : 0;
        this.rightBound = this.rightBound - this.options.numElements >= this.options.numElements - 1 ? this.rightBound - this.options.numElements : this.options.numElements - 1;
        page(false);
    }

    ArrayView.prototype.right = function () {
        this.leftBound = this.leftBound + 1 <= this.component.state.length - this.options.numElements ? this.leftBound + 1 : this.component.state.length - this.options.numElements;
        this.rightBound = this.rightBound + 1 <= this.component.state.length - 1 ? this.rightBound + 1 : this.component.state.length - 1;
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
        this.lastId = state.lastId || 0;
        var copy = this.copyTree(state, null);
        copy.lastId = this.lastId;
        S.Component.call(this, copy, view); // TODO handleState should be called
        this.height = this.computeHeights(this.state);
    }

    Tree.TreeNode = function (value, sid, left, right) {
        this.value = value;
        this.sid = sid;
        this._left = left;
        this._right = right;
    };

    Tree.prototype = Object.create(S.Component.prototype);
    Tree.prototype.constructor = Tree;


    Tree.prototype.handleState = function (state) {
        //
    };

    Tree.prototype.prepareState = function (state) {
        //state.lastId = this.lastId;
    }

    Tree.prototype.root = function (next) {
        console.dir(this);
        if (this._view)
            next(this.state);
        else
            return this.state;
    };
    Tree.prototype.root.live = true;

    Tree.prototype.add = function (parent, direction, value, next) {
        console.info('Adding node...');
        console.dir(parent);
        parent = this.getNode(parent);
        console.dir(parent);
        var added;
        if (direction) {
            if (parent.right) return; // a node is already there
            added = parent.right = new Tree.TreeNode(value, this.nextId(), null, null);
        } else {
            if (parent.left) return; // a node is already there
            added = parent.left = new Tree.TreeNode(value, this.nextId(), null, null);
        }
        console.log('Calling setNode');
        this.setNode(added);
        this.height = this.computeHeights(this.state);
        if (this._view)
            this._view.add(parent, direction, value, function () {
                next(added);
            });
        else
            return added;
    };
    Tree.prototype.add.live = true;

    Tree.prototype.remove = function (node, next) {
        node = this.getNode(node);
        var parent = node.parent;
        if (node.parent && node.parent.left == node) {
            node.parent.left = null;
        } else if (node.parent && node.parent.right == node) {
            node.parent.right = null;
        } else if (node.parent) {
            // problem
        } else {
            // must have been root node
        }
        this.height = this.computeHeights(this.state);
        if (this._view)
            this._view.remove(node, next);
    };
    Tree.prototype.remove.live = true;

    Tree.prototype.set = function (node, value, next) {
        node = this.getNode(node);
        node.value = value;
        if (this._view)
            this._view.set(node, value, function () {
                next(node);
            });
        else
            return node;
    };
    Tree.prototype.set.live = true;

    Tree.prototype.get = function (node, next) {
        node = this.getNode(node);
        if (this._view)
            next(node.value);
        else
            return node.value;
    };
    Tree.prototype.get.live = true;

    Tree.prototype.height = function (next) {
        if (this._view)
            next(this.height);
        return this.height;
    };
    Tree.prototype.height.live = true;

    /* View only methods */

    Tree.prototype.mark = function (next) {
        if (this._view) this._view.mark(next);
    };
    Tree.prototype.mark.live = true;

    Tree.prototype.markPath = function (next) {
        if (this._view) this._view.markPath(next);
    };
    Tree.prototype.markPath.live = true;

    Tree.prototype.clearPath = function (next) {
        if (this._view) this._view.clearPath(next);
    };
    Tree.prototype.clearPath.live = true;

    Tree.prototype.clearLabels = function (next) {
        if (this._view) this._view.clearLabels(next);
    };
    Tree.prototype.clearLabels.live = true;

    Tree.prototype.travel = function (parent, direction, next) {
        if (this._view) this._view.travel(parent, direction, next);
    };
    Tree.prototype.travel.live = true;

    Tree.prototype.label = function (node, label, next) {
        if (this._view) this._view.label(node, label, next);
    };
    Tree.prototype.label.live = true;

    Tree.prototype.focus = function (node, next) {
        if (this._view) this._view.focus(node, next);
    };
    Tree.prototype.focus.live = true;

    Tree.prototype.unfocus = function (node, next) {
        if (this._view) this._view.unfocus(node, next);
    };
    Tree.prototype.unfocus.live = true;

    Tree.prototype.clearFocus = function (node, next) {
        if (this._view) this._view.clearFocus(node, next);
    };
    Tree.prototype.clearFocus.live = true;

    Tree.prototype.display = function (options, next) {
        if (this._view) this._view.display(options, next);
    };
    Tree.prototype.display.live = true;

    // utils:
    Tree.prototype.allNodes = function (tree, fn) {
        if (tree) {
            fn(tree);
            this.allNodes(tree.left, fn);
            this.allNodes(tree.right, fn);
        }
    };

    Tree.prototype.copyTree = function (_node, parent) {
        if (!_node) return null;
        var n = new Tree.TreeNode(_node.value, _node.sid || this.nextId(), null, null);
        n.parent = parent;
        n.left = this.copyTree(_node.left || _node._left, n); // TODO get rid of ||
        n.right = this.copyTree(_node.right || _node._right, n); // TODO get rid of ||
        this.setNode(n);
        return n;
    };

    Tree.prototype.getNode = function (sidOrObject) {
        console.log('getNode, nodes is');
        console.dir(this.nodes);
        var sid = typeof sidOrObject === 'string' ? sidOrObject : sidOrObject.sid;
        return this.nodes[sid];
        /*if (typeof sidOrObject === 'string')
            return this.nodes[sidOrObject];
        else
            return this.nodes[sidOrObject.sid];*/
    };

    Tree.prototype.setNode = function (treeNode) {
        console.info('Setting node %s', treeNode.sid);
        this.nodes[treeNode.sid] = treeNode;
    };

    Tree.prototype.computeHeights = function (root) {
        if (root)
            return root.height = 1 + Math.max(this.computeHeights(root.left), this.computeHeights(root.right));
        return -1;
    };

    Tree.prototype.nextId = function () {
        var id = this.lastId;
        this.lastId++;
        if (this.state) this.state.lastId = this.lastId;
        return 'sid' + this.lastId;
    }

    return Tree;

})();


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
        for (var i = -2 * this._.mh; i < this._.svg.attr('width'); i += this._.mh * .5) {
            for (var j = 0; j < this._.svg.attr('height'); j += this._.mv) {
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
    }

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
