window.S = (function ($) {
    "use strict";
    var S = {};
    console.info('Initializing structural-core');

    S.VIEW_CLASS = 'structural_view';
    S.components = {};
    S.views = {};

    var components = {},
        componentMethods = {},
        standaloneMethods = {},
        componentMeta = {};

    /**
     * Registers a component.
     * @param name The name of the component.
     * @param factoryFunction A function which returns new instances of the component.
     * @param noDefault If true, Structural does not provide a default deferred execution context on instances of this component.
     */
    S.defineComponent = function (name, factoryFunction, noDefault) {
        components[name] = factoryFunction;
        /* middleware & default deferred context */
        S.components[name] = function () {
            var component = components[name].apply(this, arguments);
            // provide default deferred context
            if (S.config.provideDefaultDeferredContext && !noDefault) {
                provideDefaultDeferredContext(component);
            }
            // give default view
            if (S.views[name]) {
                console.log('setting view ' + name);
                component.view = S.views[name]();
            }
            // initialize component
            if (component.init) component.init();
            return component;
        }
    }

    S.defineComponent2 = function (name, ctor, noDefault) {
        components[name] = ctor;
        S.components[name] = function (state, view) {
            var component = new components[name](state, view);

            if (S.config.provideDefaultDeferredContext && !noDefault) {
                provideDefaultDeferredContext(component);
            }

            if (S.views[name]) {
                component.view = S.views[name]();
            }

            //if(component.init) component.init();

            return component;
        }
    }

    S.defineMethodOn = function (name, methodName, func) {
        if (!componentMethods[name])
            componentMethods[name] = {};
        componentMethods[name][methodName] = func;
    }

    S.defineStandaloneMethod = function (requirements, optionalRequirements, func) {
        if (!standaloneMethods[name])
            standaloneMethods[name] = {};
        standaloneMethods[name].requirements = requirements;
        standaloneMethods[name].optionalRequirements = optionalRequirements;
        standaloneMethods[name][methodName] = func;
    }

    S.setMetaData = function (name, meta) {
        componentMeta[name] = meta;
    }

    function provideDefaultDeferredContext(component) {
        /*component.def = new S.Deferred(); //S.deferred();
  component.def.wrap(component);
  component.deferredContext = component.def.getContext();       */
    }

    S.setDefaultView = function (name, factory) {
        S.views[name] = factory;
    }

    /*S.addView = function(component, name, func) {
    if(!S.views[component])
      S.views[component] = {};
    S.views[component][name] = func;
}*/

    S.addMethod = function (componentName, methodName, func) {
        if (!componentMethods[componentName])
            componentMethods[componentName] = {};
        componentMethods[componentName][methodName] = func;
    }

    S.getComponentMethods = function (componentName) {
        return componentMethods[componentName];
    }

    S.config = {
        provideDefaultDeferredContext: true,
        /* Provide a deferred context on newly created components. */
        viewClass: 'structural_view' /* CSS class for views */
    };

    var id = 0;

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

    S.EventEmitter = function () {
        this.registeredEvents = {};
    }

    S.EventEmitter.prototype.on = function (eventName, fn) {
        if (!this.registeredEvents[eventName]) //typeof this.registeredEvents[eventName] === 'undefined')
            this.registeredEvents[eventName] = [];
        this.registeredEvents[eventName].push(fn);
    };

    S.EventEmitter.prototype.fire = function (eventName, event) {
        if (!this.registeredEvents[eventName]) //typeof this.registeredEvents[eventName] === 'undefined')
            return;
        for (var i = 0; i < this.registeredEvents[eventName].length; i++) {
            this.registeredEvents[eventName][i].call(event, event);
        }
    };


    S.ee = function () {
        var ee = {};
        ee.registeredEvents = {};

        ee.on = function (eventName, fn) {
            if (typeof ee.registeredEvents[eventName] === 'undefined')
                ee.registeredEvents[eventName] = [];
            ee.registeredEvents[eventName].push(fn);
        };

        ee.fire = function (eventName, event) {
            if (typeof ee.registeredEvents[eventName] === 'undefined')
                return;
            for (var i = 0; i < ee.registeredEvents[eventName].length; i++) {
                ee.registeredEvents[eventName][i].call(event, event);
            }
        };

        return ee;
    }

    S.Component = (function () {
        function Component(state, view) {
            if (state)
                this.state = state;
            if (view)
                this.view = view;
        }

        Component.prototype = Object.create(S.EventEmitter.prototype);

        Object.defineProperty(Component.prototype, 'state', {
            get: function () {
                return this._state;
            },
            set: function (state) {
                this._state = state;
            }
        });

        Object.defineProperty(Component.prototype, 'view', {
            get: function () {
                return this._view;
            },
            set: function (view) {
                this._view = view;
                view.component = this;
                view.live.component = this;
                view.init();
            }
        });

        Component.prototype.getSync = function () {
            return this.live;
        };

        Component.prototype.getAsync = function () {
            console.log('getAsync');
            return this.view.live;
        };

        Component.prototype.getMethods = function () {
            return S.getComponentMethods(this.alias);
        };

        return Component;
    })();

    S.View = (function ($) {
        function View() {
            //this.live = {}; // TODO delete
            this._config = {};
            this.$element = $('<div>').addClass(S.VIEW_CLASS);
        }

        View.prototype = Object.create(S.EventEmitter.prototype);

        View.prototype.init = function () {};

        View.prototype.render = function () {};

        // TODO remove scaleTo:
        View.prototype.scaleTo = function (dimensions) {
            this.$element.width(dimensions.width);
            this.$element.height(dimensions.height);
        };

        // TODO keep this:
        /**
         * Adjusts the View's drawing parameters based on `dimensions`.
         * @param dimensions An object containing `width` and `height` properties.
         */
        View.prototype.scale = function (dimensions) {
            this.$element.width(dimensions.width);
            this.$element.height(dimensions.height);
        };

        View.prototype.clear = function () {
            this.$element.empty();
        };

        Object.defineProperty(View.prototype, 'config', {
            get: function () {
                return this._config;
            },
            set: function (options) {
                $.extend(this._config, options);
            }
        });

        return View;
    })(jQuery);



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






    S.DeferredInterface = (function () {

        function DeferredInterface(queue) {
            S.EventEmitter.call(this); // TODO phase out?
            this.queue = queue;
            this.clones = {}; // TODO store wrappable clones here
            var self = this;
            this.interface = function (key, value) {
                if (typeof value === 'undefined')
                    return self.interface._get(key);
                self.interface._set(key, value);
            };
            this.include(std());
        };

        DeferredInterface.prototype = Object.create(S.EventEmitter.prototype);

        /**
         * Returns the actual interface. After wrappables are included, they can be used from this interface.
         *
         * @returns {Function}
         */
        DeferredInterface.prototype.handle = function () {
            return this.interface;
        }

        DeferredInterface.prototype.add = function (name, func) {
            func.bind(this.interface);
            this.interface[name] = func;
        }

        /**
         * Include a wrappable in this interface. Operations are pushed to this DeferredInterface's queue, and also executed
         * on a stateful copy of the wrappable. The result is that objects with asynchronous behavior can be coded synchronously.
         * @param wrappable An object which satisfies the `wrappable` interface.
         */
        DeferredInterface.prototype.include = function (wrappable) {
            // console.info('Including ' + wrappable);
            var self = this,
                clone;
            console.assert(wrappable.getSync && wrappable.getAsync, '`wrappable` satisfies interface.');
            if (!wrappable.noCopy) {
                clone = new wrappable.constructor(wrappable.state);
            }

            console.groupCollapsed('Wrapping methods of \'%s\'', wrappable.alias || wrappable);
            console.dir(wrappable);

            for (var prop in wrappable.getSync()) {
                console.log('Wrapping \'%s\'', prop);
                this.interface[prop] =
                    (function (property, clone) {
                    var interfaceMethod = function () {
                        var args = Array.prototype.slice.call(arguments),
                            ret,
                            pushFn;

                        if (wrappable.getSync()[property] !== null && wrappable.noCopy) {
                            ret = wrappable.getSync()[property].apply(wrappable, args);
                        } else if (wrappable.getSync()[property] !== null) {
                            ret = clone.getSync()[property].apply(clone, args);
                        }

                        pushFn = function (fn) {
                            fn.deferredInterface = self;
                            fn.speed = 1; // TODO
                            if (wrappable.getSync()[property])
                                wrappable.getSync()[property].apply(wrappable, args);
                            if (wrappable.getAsync()[property])
                                wrappable.getAsync()[property].apply(wrappable.getAsync(), args.concat(fn));
                            else
                                fn();
                        };

                        pushFn.toString = function () {
                            return property;
                        };

                        self.queue.push.call(self.queue, pushFn);
                        return ret;
                    };
                    return interfaceMethod;
                })(prop, clone);
            }
            console.groupEnd();
            /* now, add in defined methods */

            if (wrappable.getMethods) {
                var methods = wrappable.getMethods();
                console.groupCollapsed('Adding defined methods of \'%s\'', wrappable.alias || wrappable);
                for (var method in methods) {
                    console.log('Adding ' + method);
                    this.add(method, methods[method]);
                }
            } else {
                //console.log('no getMethods found');
            }
            console.groupEnd();
        }

        function std() {
            var std = {
                    getAsync: function () {
                        return this.async;
                    },
                    getSync: function () {
                        return this.live;
                    },
                    live: {},
                    async: {},
                    noCopy: true
                },
                vars = {};
            std.live.log = function (str) {
                console.log(str);
            };
            std.live.warn = function (msg) {
                console.warn(msg);
            };
            std.live._set = function (key, value) {
                vars[key] = value;
            };
            std.live._get = function (key) {
                return vars[key];
            };
            std.live.is = function (key, value) {
                return vars[key] === value;
            };
            std.live.flog = null;
            std.async.flog = function (str, fn) {
                console.log(str);
                fn();
            };
            std.live.fwarn = null;
            std.async.fwarn = function (str, fn) {
                console.warn(str);
                fn();
            };
            return std;
        }

        return DeferredInterface;
    })();



    S.Scope = (function () {

        function Scope(items) {
            this.queue = new S.AsyncFunctionQueue();
            this.interface = new S.DeferredInterface(this.queue);
            this.include(items);
        }

        Scope.prototype.include = function (items) {
            if (Array.isArray(items)) {
                items.forEach(this.interface.include);
            } else {
                this.interface.include(items);
            }
        };

        return Scope;

    })();


    S.component = function (name, factory, meta) {
        S.defineComponent(name, factory, false);
        if (meta)
            S.setMetaData(name, meta);
    }

    S.method = function (componentName, methodName, func) {
        // TODO
        S.defineMethodOn(componentName, methodName, func);
    };

    S.view = function (componentName, factory) {
        S.setDefaultView(componentName, factory);
    }


    return S;
})(jQuery);

(function () {

    function Array(state, view) {
        //this.live.component = this;
        this.alias = 'array';
        S.Component.call(this, [].concat(state), view);
        this.state.flags = [];
    }

    Array.prototype = Object.create(S.Component.prototype);
    Array.prototype.constructor = Array;
    Array.prototype.live = {};

    Array.prototype.live.getLength = function () {
        return this.state.length;
    };

    Array.prototype.live.flag = function (index) {
        this.state.flags[index] = true;
    };

    Array.prototype.live.flagged = function (index) {
        return this.state.flags[index];
    };

    Array.prototype.live.setItem = function (index, value) {
        this.state[index] = value;
    };

    Array.prototype.live.getItem = function (index) {
        return this.state[index];
    };

    Array.prototype.live.push = function (item) {
        this.state.push(item);
    }

    Array.prototype.live.focus = null;

    Array.prototype.live.range = null;

    Array.prototype.live.range = null;

    Array.prototype.live.clearfocus = null;

    Array.prototype.live.clearrange = null;

    Array.prototype.live.leftTo = null;

    S.defineComponent2('array2', Array);

})();


S.view('array2',
    function (options) {
        var view = new S.View(), //S.baseView(),
            $e,
            $table,
            $topRow,
            $bottomRow,
            $cells = $(),
            $indices = $(),
            computedWidth,
            width,
            border = 0,
            computedCellWidth,
            height;

        view.init = function () {
            view.config = {
                hiddenDelimiter: ',',
                numElements: 5,
                pageTime: 300,
                stepTime: 50,
                scrollTime: 500,
                maxScrollTime: 1000
            };
            view.config = options;
            view.leftBound = 0;
            view.rightBound = view.config.numElements - 1;
        }

        view.config = function (options) {
            $.extend(view.config, options);
            view.leftBound = 0;
            view.rightBound = view.config.numElements - 1;
        }

        view.render = function () {
            if ($e)
                $e.remove();
            $cells = $();
            $indices = $();
            $e = $('<div class="array"></div>');
            $table = $('<table></table>');
            $topRow = $('<tr></tr>').addClass('array-top');
            $bottomRow = $('<tr></tr>').addClass('array-bottom');
            $e.append($table);
            $table.append($topRow).append($bottomRow);

            $table.css({
                height: height
            });

            $topRow.css({
                fontSize: Math.round($table.height() * .25)
            });

            for (var i = 0; i < view.component.state.length; i++) {
                var $td = $('<td>' + view.component.state[i] + '<span style="font-size: 0;">' + view.config.hiddenDelimiter + '</span></td>'),
                    $th = $('<th>' + i + '</th>');
                $td.data('index', i);
                $th.data('index', i);
                $td.width(computedCellWidth);
                $th.width(computedCellWidth);
                $td.addClass('array-cell');
                $th.addClass('array-index');
                $topRow.append($td);
                $bottomRow.append($th);
                $cells = $cells.add($td);
                $indices = $indices.add($th);
            }

            computedWidth = computedCellWidth + border;
            width = view.config.numElements * computedWidth + border;
            $e.css('width', width);
            bindEvents($cells);
            view.$element.append($e);
            return view.$element;
        }

        view.scaleTo = function (dimensions) {
            width = dimensions.width;
            height = dimensions.height;
            view.$element.css('width', dimensions.width);
            view.$element.css('height', dimensions.height);
            computedCellWidth = Math.floor(width / view.config.numElements) - border;
            view.render();
        }

        function bindEvents($_cells, $_indices) {
            //$e.mousewheel(handleMousewheel); // TODO needs mousewheel
            $_cells.click(handleTdClick);
            $_cells.dblclick(handleTdDblClick);
        }

        function handleTdClick(e) {
            view.live.focus($(this).data('index'));
        }

        function handleTdDblClick(e) {
            // TODO inform component
            if ($(this).hasClass('flagged'))
                $(this).removeClass('flagged');
            else
                $(this).addClass('flagged');
        }

        function handleMousewheel(e) {
            console.log(e);
            if (e.deltaY < 0) {
                view.left();
            } else {
                view.right();
            }
        }

        function handleKeydown(e) {
            console.log('keyDown');
            if (e.keyCode === 39)
                view.right();
        }

        view.live.focus = function (index, fn) {
            if (index < 0 || index > view.component.state.length - 1)
                return;
            $cells.removeClass('focus');
            $indices.removeClass('focus');
            $cells.eq(index).addClass('focus');
            $indices.eq(index).addClass('focus');
            var idx = index - Math.floor(view.config.numElements / 2);
            view.live.leftTo(idx, fn);
        }

        view.live.clearfocus = function (fn) {
            $cells.removeClass('focus');
            $indices.removeClass('focus');
            fn();
        }

        view.live.flag = function (index, fn) {
            $cells.eq(index).addClass('flagged');
            if (fn) fn();
        }

        view.live.range = function (start, end, num, fn) {
            var $range = $cells.slice(start, end + 1),
                clazz = 'range' + num;
            // TODO why do I do this? -v
            $range.addClass(function (i) {
                var classes = $range.eq(i).attr('class'),
                    newClass = clazz + ' ' + classes;
                $range.eq(i).attr('class', newClass);
            });
            fn();
        }

        view.live.clearrange = function (num, fn) {
            $cells.removeClass('range' + num);
            fn();
        }

        view.live.setItem = function (index, item, fn) {
            view.live.focus(index, function () {
                S.wait(function () {
                    $cells.eq(index).addClass('array-remove');
                    S.wait(function () {
                        $cells.eq(index).text(item);
                        $cells.eq(index).removeClass('array-remove');
                        fn();
                    }, 300);
                }, 200);
            });
        }

        view.live.push = function (item, fn) {
            var $added = addItem(item, view.component.state.length - 1);
            view.live.leftTo(view.component.state.length - 1, function () {
                $added.animate({
                    opacity: 1
                }, 200, function () {
                    fn();
                });
            });
        }

        function addItem(item, index) {
            var $newTd = $('<td>' + item + '</td>'),
                $newTh = $('<th>' + index + '</th>');
            var $both = $newTd.add($newTh).css({
                opacity: 0,
                width: computedCellWidth
            });
            $newTd.addClass('array-cell');
            $newTh.addClass('array-index');
            $both.data('index', index);
            $topRow.append($newTd);
            $bottomRow.append($newTh);
            $cells = $cells.add($newTd);
            $indices = $indices.add($newTh);
            bindEvents($newTd, $newTh);
            return $both;
        }

        view.live.leftTo = function (index, fn) {
            index = parseInt(index, 10);
            if (isNaN(index))
                return;
            if (index <= 0)
                index = 0;
            if (index >= view.component.state.length - 1)
                index = view.component.state.length - 1;
            var time = Math.min(Math.abs(index - view.leftBound) * view.config.stepTime, view.config.maxScrollTime);
            if (index == 0) {
                view.leftBound = 0;
                view.rightBound = view.config.numElements - 1;
            } else if (index > view.component.state.length - view.config.numElements) {
                view.leftBound = view.component.state.length - view.config.numElements;
                view.rightBound = view.component.state.length - 1;
            } else {
                view.leftBound = index;
                view.rightBound = index + view.config.numElements - 1;
            }
            scrollTo(index * computedWidth, time, fn);
        }

        view.live.rightTo = function (index) {
            index = parseInt(index, 10);
            if (isNan(index))
                return;
            if (index <= 0)
                index = 0;
            if (index >= view.component.state.length - 1)
                index = view.component.state.length - 1;
            var time = Math.min(Math.abs(index - view.leftBound) * view.config.stepTime, view.config.maxScrollTime);
            if (index <= view.config.numElements - 1) {
                view.leftBound = 0;
                view.rightBound = view.config.numElements - 1;
            } else if (index == view.component.state.length - 1) {
                view.leftBound = view.component.state.length - view.config.numElements;
                view.rightBound = view.component.state.length - 1;
            } else {
                view.leftBound = index - view.config.numElements + 1;
                view.rightBound = index;
            }
            scrollTo(index * computedWidth, time);
        }

        view.pageRight = function () {
            view.leftBound = view.leftBound + view.config.numElements <= view.component.state.length - view.config.numElements ? view.leftBound + view.config.numElements : view.component.state.length - view.config.numElements;
            view.rightBound = view.rightBound + view.config.numElements <= view.component.state.length - 1 ? view.rightBound + view.config.numElements : view.component.state.length - 1;
            page(true);
        }

        view.pageLeft = function () {
            view.leftBound = view.leftBound - view.config.numElements >= 0 ? view.leftBound - view.config.numElements : 0;
            view.rightBound = view.rightBound - view.config.numElements >= view.config.numElements - 1 ? view.rightBound - view.config.numElements : view.config.numElements - 1;
            page(false);
        }

        view.right = function () {
            view.leftBound = view.leftBound + 1 <= view.component.state.length - view.config.numElements ? view.leftBound + 1 : view.component.state.length - view.config.numElements;
            view.rightBound = view.rightBound + 1 <= view.component.state.length - 1 ? view.rightBound + 1 : view.component.state.length - 1;
            step(true);
        }

        view.left = function () {
            view.leftBound = view.leftBound - 1 >= 0 ? view.leftBound - 1 : 0;
            view.rightBound = view.rightBound - 1 >= view.config.numElements - 1 ? view.rightBound - 1 : view.config.numElements - 1;
            step(false);
        }

        function page(right) {
            scroll(right, view.config.pageTime, width - 1);
        }

        function step(right) {
            scroll(right, view.config.stepTime, computedWidth);
        }

        function scroll(right, time, amount) {
            var str = '+=';
            if (!right) str = '-=';
            var anim = {};
            anim.scrollLeft = str + amount;
            $e.animate(anim, time);
            //view.fire('change', {});
        }

        function scrollTo(amount, time, fn) {
            $e.animate({
                scrollLeft: amount
            }, time, function () {
                if (typeof fn !== 'undefined')
                    fn();
            });
        }

        return view;
    });

(function () {

    /*
  NOTE:
  Components should not accept objects as parameters. If they do, they should only use and id property set on object, because
  doing operations on the actual object passed in will not work, because it references an object in the synchronous phase.
  Basically, pretend component is a webserver receiving requests. It cannot maintain a map of external objects, etc.
  Example violation:

  var obj = {};
  component.setObj('myObj', obj);
  var gotten = component.getObj('myObj');
  obj === gotten // NOT guaranteed
   */


    function TreeNode(sid) {
        this.sid = sid;
        var self = this;
        Object.defineProperty(this, 'left', {
            get: function () {
                return this.left;
            },
            set: function (value) {
                self.treeInterface.set(node.left, value);
            }
        });
        Object.defineProperty(this, 'right', {
            get: function () {
                return this.right;
            },
            set: function (value) {
                self.treeInterface.set(node.right, value);
            }
        });
        this.focus = function () {
            self.treeInterface.focus(node);
        };
    }

    function Tree(state, view) {
        // this.live.component = this; // no need, this bound in deferred
        this.alias = 'tree';
        this.nodeMap = {};
        this.treeNodes = {}; // TODO
        var s = this._copyTree(state, null);
        console.log('Tree setting view');
        console.dir(view);
        S.Component.call(this, s, view);
    }

    Tree.prototype = Object.create(S.Component.prototype);
    Tree.prototype.constructor = Tree;
    Tree.prototype.live = {};

    // TODO delete
    // Tree.prototype.noCopy = true;

    /*Tree.prototype.setState = function(state) {
    this.state = state;
    this.height = computeHeights(this.state);
  }*/

    Object.defineProperty(Tree.prototype, 'state', {
        get: function () {
            return this._state;
        },
        set: function (state) {
            this._state = state;
            this.height = computeHeights(this.state);
        }
    });

    /**
     * Returns the root of the tree.
     * @returns {*}
     */
    Tree.prototype.live.root = function () {
        return this.state;
    }
    Tree.prototype.live.root.getter = true;

    /**
     * Returns the height of the tree.
     * @returns {*}
     */
    Tree.prototype.live.height = function () {
        this.height = computeHeights(this.state);
        return this.height;
    }
    Tree.prototype.live.height.getter = true;

    /**
     * Adds a node to the tree.
     * @param parent The parent to add the node onto.
     * @param direction The direction to add the node (false for left, true for right).
     * @param value The value of the new node.
     * @returns {*} The added node.
     */
    Tree.prototype.live.add = function (parent, direction, value) {
        console.log('Adding %s', value);
        parent = this.nodeMap[parent.sid];
        var added;
        if (direction) {
            added = parent.right = node(value);
        } else {
            added = parent.left = node(value);
        }
        added.sid = S.nextId();
        this.nodeMap[added.sid] = added;
        console.dir(added);
        console.log('parent it');
        console.dir(parent);
        this.height = computeHeights(this.state);
        return bindGetters(added);
    }

    /**
     * Removes the given node from the tree and all of its children.
     * @param node The node to remove.
     */
    Tree.prototype.live.remove = function (node) {
        console.info('Removing node ' + node.sid);

        node = this.nodeMap[node.sid];
        var parent = this.nodeMap[node.parent.sid];

        if (node.parent && node.parent.left == node) {
            node.parent.left = null;
        } else if (node.parent && node.parent.right == node) {
            node.parent.right = null;
        } else {

        }
        this.height = computeHeights(this.state);
    }

    /**
     * Sets the value of the given node.
     * @param node
     * @param value
     */
    Tree.prototype.live.set = function (node, value) {
        node = this.nodeMap[node.sid];
        node.value = value;
        return node;
    }

    /**
     * Sets the [direction] child of `parent` to `child`.
     * @param parent
     * @param direction false for left, true for right
     * @param child
     */
    Tree.prototype.live.setChild = function (parent, direction, child) {
        // TODO
    }

    Tree.prototype.live.verify = function () {
        console.dir(this.state);
    }

    /*
  View only methods
   */
    Tree.prototype.live.mark = null;

    Tree.prototype.live.markPath = null;

    Tree.prototype.live.clearPath = null;

    Tree.prototype.live.showHeights = null;

    Tree.prototype.live.hideHeights = null;

    Tree.prototype.live.clearLabels = null;

    //Tree.prototype.live.clearlabels = null;

    //Tree.prototype.live.clearfocus = null;

    Tree.prototype.live.travel = null;

    Tree.prototype.live.label = null;

    Tree.prototype.live.focus = null;

    Tree.prototype.live.unfocus = null;

    // utils:

    Tree.prototype._copyTree = function (_node, parent) {
        // this should use either left or _left to lookup child references
        console.log('copying tree');
        if (!_node) return null;
        var n = node(_node.value);
        if (_node.sid)
            n.sid = _node.sid;
        else
            n.sid = S.nextId();
        n.parent = parent;
        n.left = this._copyTree(_node.left || node._left, n);
        n.right = this._copyTree(_node.right || node._right, n);
        if (n.sid == 'sid_0') {
            console.log('ROOT');
            console.dir(n);
        }
        this.nodeMap[n.sid] = n;
        return n;
    }

    function bindGetters(node) {
        return node;
    }

    function computeHeights(root) {
        if (root)
            return root.height = 1 + Math.max(computeHeights(root.left), computeHeights(root.right));
        return -1;
    }

    function computeParents(root) {

    }

    function node(value) {
        return {
            value: value,
            left: null,
            right: null
        };
    }



    S.defineComponent2('tree', Tree);

})();

S.view('tree', function () {
    var view = new S.View(), //new S.View(), //S.baseView(),
        data = S.map(), // stores data about nodes
        $e,
        dom_svg,
        s_svg, // snap svg object
        $svg, // jQuery svg object
        width = 100,
        height = 100,
        nodeRadius = 8,
        mh = 32, // horizontal margin between nodes
        mv = 32, // vertical margin between nodes
        x0, // x offset
        y0; // y offset
    view.live = {};

    view.scaleTo({
        width: 500,
        height: 300
    });

    /*
   example node data:
   {
   x: 100,
   y: 100,
   element: [svg element],
   leftLine: [svg element],
   rightLine: [svg element],
   label: 'some text',
   s_value: [svg element],
   s_height: [svg element]
   }
   */

    view.init = function () {

    }

    view.scaleTo = function (dimensions) {
        //console.log('scaling tree');
        width = dimensions.width;
        height = dimensions.height;
        x0 = width / 2;
        nodeRadius = view.config.nodeRadius || .05 * height; // TODO
        y0 = nodeRadius;
        mv = view.config.mv || height / 5; //(height / view.component.height()) - nodeRadius;
        mh = view.config.mh || mv + nodeRadius / 2;
        view.$element.width(width);
        view.$element.height(height);
        view.render();
    }

    view.render = function () {
        //console.log('rendering');
        if ($e) $e.remove();
        $e = $('<div class="tree"></div>');
        dom_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); // http://stackoverflow.com/questions/20045532/snap-svg-cant-find-dynamically-and-successfully-appended-svg-element-with-jqu
        $svg = $(dom_svg)
            .width(width)
            .height(height)
            .appendTo($e);
        s_svg = Snap(dom_svg);
        s_svg.addClass('tree-svg');
        rg(view.component.state, data, {
            mh: mh,
            mv: mv,
            x0: x0,
            y0: y0
        });
        drawLines(view.component.state);
        allNodes(view.component.state, function (node) {
            console.info('allNodes %s', node.sid);
            data(node).element = drawNode(node, data(node).x, data(node).y);
            data(node).s_value = drawValue(node.value, data(node).x, data(node).y);
            data(node).s_height = drawHeight(node);
            drawHeightIcon(node);
        });
        view.$element.append($e);
        return view.$element;
    }

    function drawNode(node, x, y) {
        return circle = s_svg.circle(x + x0, y + y0 + 2, nodeRadius)
            .addClass('tree-node');
    }

    function drawLabel(node, label) {
        return s_svg.text(data(node).x + x0 + nodeRadius + 5, data(node).y + y0 + nodeRadius / 2 - 3, '/' + label)
            .addClass('tree-node-label')
            .attr('text-anchor', 'right')
            .attr('font-size', nodeRadius);
    }

    function drawValue(value, x, y) {
        return s_svg.text(x + x0 /*- 10*/ , y + y0 + nodeRadius * .5 + 2, value + '')
            .addClass('tree-node-value')
            .attr('text-anchor', 'middle')
            .attr('font-size', nodeRadius * 1.25);
    }

    function drawLine(xi, yi, xf, yf) {
        return s_svg.line(xi + x0, yi + y0, xf + x0, yf + y0)
            .addClass('tree-line'); //.attr('stroke', 'black');
    }

    function drawHeight(node) {
        return s_svg.text(data(node).x + x0 - nodeRadius - nodeRadius * .85, data(node).y + y0 + nodeRadius / 2 - 3, node.height + '')
            .attr('font-size', nodeRadius)
            .addClass('tree-height');
    }

    function drawHeightIcon(node) {
        //s_svg.image('height.png', data(node).x + x0 - nodeRadius - nodeRadius * 1.1, data(node).y + y0 - nodeRadius * .3, 5, nodeRadius * .75);
    }


    /**
     * Recursive method to draw connecting lines of tree.
     * @param root
     */
    function drawLines(root) {
        if (root.left) {
            data(root).leftLine = drawLine(data(root).x, data(root).y, data(root.left).x, data(root.left).y);
            drawLines(root.left);
        }
        if (root.right) {
            data(root).rightLine = drawLine(data(root).x, data(root).y, data(root.right).x, data(root.right).y);
            drawLines(root.right);
        }
    }

    function allNodes(root, func) {
        if (root) {
            func(root)
            allNodes(root.left, func);
            allNodes(root.right, func);
        }
    }


    view.live.focusOn = function (node, fn) {
        console.log('node.sid %s', node.sid);
        node = view.component.nodeMap[node.sid];
        console.dir(data(node));
        if (!node) return;
        var circle = data(node).element
            .addClass('focus');
        fn();
    }

    view.live.clearfocus = function (fn) {
        data.forEach(function (pair) {
            pair[1].element.removeClass('focus');
        });
        fn();
    }

    view.live.add = function (parent, direction, value, fn) {
        console.log('VIEW ADD');
        parent = view.component.nodeMap[parent.sid];
        console.dir(parent.left);
        /*if(direction) {
      data(parent.right).doNotDraw = true;
    } else {
      data(parent.left).doNotDraw = true;
    }*/
        // TODO animate addition of node
        view.scaleTo({
            width: width,
            height: height
        });
        view.render();
        /*rg(view.component.state, data, {
     xProperty: 'newX',
     yProperty: 'newY'
     }); */
        //moveToNewPositions(view.component.state);
        fn();
    }

    function moveToNewPositions(root) {
        if (root) {
            var _data = data(root),
                circle = data.element;
            if (circle) {
                circle.animate({
                    x: _data.newX,
                    y: _data.newY
                }, 1000, null, function () {

                });
            }
            moveToNewPositions(root.left);
            moveToNewPositions(root.right);
        }
    }

    view.live.travel = function (parent, direction, fn) {
        if (direction) {
            if (data(parent).rightLine) {
                var rightLine = data(parent).rightLine;
                rightLine.addClass('tree-line-active');
                var s_circle = s_svg.circle(rightLine.attr('x1'), rightLine.attr('y1'), 5)
                    .addClass('tree-travelorb');
                s_circle.insertAfter(rightLine);
                s_circle.animate({
                    cx: rightLine.attr('x2'),
                    cy: rightLine.attr('y2')
                }, 500, null, function () {
                    s_circle.remove();
                    fn();
                });
            } else {
                fn();
            }
        } else {
            if (data(parent).leftLine) {
                var leftLine = data(parent).leftLine;
                leftLine.addClass('tree-line-active');
                var s_circle = s_svg.circle(leftLine.attr('x1'), leftLine.attr('y1'), 5)
                    .addClass('tree-travelorb');
                s_circle.insertAfter(leftLine);
                s_circle.animate({
                    cx: leftLine.attr('x2'),
                    cy: leftLine.attr('y2')
                }, 500, null, function () {
                    s_circle.remove();
                    fn();
                });
            } else {
                fn();
            }
        }
    };

    view.live.label = function (node, label, fn) {
        if (node && data(node)) {
            data(node).label = label;
            data(node).s_label = drawLabel(node, label);
            fn();
        } else {
            fn();
        }
    }

    view.live.setNode = function (node, value, fn) {
        var s_node = data(node).element,
            s_value = data(node).s_value;
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
    }

    view.live.clear = function (fn) {
        view.render();
        fn();
    }

    view.live.clearlabels = function (fn) {
        data.forEach(function (pair) {
            view.live.clearlabel(pair[0]);
        });
        fn();
    }

    view.live.clearlabel = function (node, fn) {
        if (data(node).s_label) {
            data(node).s_label.remove();
            data(node).label = undefined;
            data(node).s_label = undefined;
        }
        if (fn) fn();
    }

    view.live.showHeights = function (fn) {
        data.forEach(function (pair) {
            view.live.height(pair[0], true);
        });
        fn();
    }

    view.live.hideHeights = function (fn) {
        data.forEach(function (pair) {
            view.live.height(pair[0], false);
        });
        fn();
    }

    view.live.height = function (node, show, fn) {
        if (!node || !data(node).s_height) return;
        if (show)
            data(node).s_height.attr('visibility', 'visible');
        else
            data(node).s_height.attr('visibility', 'hidden');
        if (fn) fn();
    }

    view.live.remove = function (node, fn) {
        var elements = getTreeElements(node),
            parent = node.parent,
            count = 0,
            max;

        if (parent.left == null) {
            elements.push(data(parent).leftLine);
            delete data(parent).leftLine;
        } else {
            elements.push(data(parent).rightLine);
            delete data(parent).rightLine;
        }

        max = elements.length;

        elements.forEach(function (element) {
            if (!element) {
                count++;
                return;
            }
            if (element.attr('cy')) {
                element.animate({
                    cy: 1000
                }, 500, mina.easeinout, function () {
                    count++;
                    checkIfAllRemoved();
                });
            } else if (element.attr('y1')) {
                element.animate({
                    y1: 1000,
                    y2: 1000
                }, 500, mina.easeinout, function () {
                    count++;
                    checkIfAllRemoved();
                });
            } else {
                element.animate({
                    y: 1000
                }, 500, mina.easeinout, function () {
                    count++;
                    checkIfAllRemoved();
                });
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
    }

    function getTreeElements(root) {
        var ret = [];
        if (root) {
            ret.push(data(root).element);
            ret.push(data(root).s_height);
            ret.push(data(root).s_value);
            ret.push(data(root).s_label);
            ret.push(data(root).leftLine);
            ret.push(data(root).rightLine);
            return ret.concat(getTreeElements(root.left).concat(getTreeElements(root.right)));
        }
        return ret;
    }

    view.live.mark = function (node, num, fn) {
        if (data(node).element) {
            data(node).element.addClass('range' + num);
            fn();
        }
    }

    view.live.markPath = function (node, dir, num, fn) {
        if (dir && data(node).rightLine) {
            data(node).rightLine.addClass('pathrange' + num);
        } else if (data(node).leftLine) {
            data(node).leftLine.addClass('pathrange' + num);
        }
        fn();
    }

    view.live.clearPath = function (node, dir, num, fn) {
        if (dir && data(node).rightLine) {
            data(node).rightLine.removeClass('pathrange' + num);
        } else if (data(node).leftLine) {
            data(node).leftLine.removeClass('pathrange' + num);
        }
        fn();
    }

    view.add = function (parent_s, left, value, fn) {
        /*nodes(parent_s, getNodeElement(value));
     rg(view.component.state, data, view.config);
     nodes.forEach(function(pair){
     move(nodes(pair[0]), pair[1].x, pair[1].y, function(){
     $e.append(nodes(parent_s));
     });
     });*/
    }

    function move($elem, x, y, fn) {
        /*$elem.animate({
     left: x,
     top: y
     }, 250, function(){
     fn();
     });*/
    }

    /**
     * My (Alex Kizer's) crappy implementation of the Reingold-Tilford algorithm.
     * http://emr.cs.iit.edu/~reingold/tidier-drawings.pdf
     * @param root Root of the tree to draw.
     * @param store A map where position data will be deposited.
     * @param options Options to specify the minimum vertical and horizontal spacing between nodes.
     */
    function rg(root, store, options) {
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
            this.left = null; //node.left;
            this.right = null; //node.right;
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
                leftOffsetSum, // offset from root
                rightOffsetSum; // offset from root


            if (!node /*== null*/ ) {
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
                    leftMost.offset = 0; // ? TODO
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
            store(root)[config.xProperty] = root.x;
            store(root)[config.yProperty] = root.y;
            /*store(root, {
       x: root.x,
       y: root.y
       });*/
            copyToStore(root.left, store);
            copyToStore(root.right, store);
        }


    }

    return view;
});

S.TreeView = (function () {

    function TreeView() {
        S.View.call(this);
        this._ = {};
        this._.data = S.map();
        this.options = {
            classes: {
                svg: 'tree-svg',
                node: 'tree-node',
                value: 'tree-value',
                height: 'tree-height',
                line: 'tree-line'
            },
            easings: {
                remove: mina.easeinout
            }
        };
        this.live.view = this;
    }

    TreeView.prototype = Object.create(S.View.prototype);
    TreeView.prototype.constructor = TreeView;
    TreeView.prototype.live = {};

    TreeView.prototype.init = function () {

    };

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
        this.$element.width(_.width);
        this.$element.height(_.height);
        return this.render();
    };

    TreeView.prototype.render = function () {
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
            _.data(node).element = self._drawNode(node, _.data(node).x, _.data(node).y);
            _.data(node).s_value = self._drawValue(node.value, _.data(node).x, _.data(node).y);
            _.data(node).s_height = self._drawHeight(node.height, _.data(node).x, _.data(node).y);
        });
        this.$element.append(_._svg);
        return this.$element;
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

    TreeView.prototype.live.add = function (parent, direction, value, fn) {
        var parent = this.component.nodeMap[parent.sid],
            _ = this.view._;
        this.view.scaleTo({
            width: _.width,
            height: _.height
        });
        this.view.render();
        fn();
    };

    TreeView.prototype.live.set = function (node, value, fn) {
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

    TreeView.prototype.live.remove = function (node, fn) {
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

    TreeView.prototype.live.focus = function (node, fn) {
        node = this.view.component.nodeMap[node.sid];
        if (node)
            this.view._.data(node).element.addClass('focus');
        fn();
    };

    TreeView.prototype.live.unfocus = function (node, fn) {
        node = this.view.component.nodeMap[node.sid];
        if (node)
            this.view._.data(node).element.removeClass('focus');
        fn();
    };

    TreeView.prototype.live.clearFocus = function (node, fn) {

    }

    TreeView.prototype.live.travel = function (node, direction, fn) {

    };

    TreeView.prototype.live.label = function (node, label, fn) {

    };

    TreeView.prototype.live.clearLabels = function (fn) {

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
    TreeView.prototype.live.display = function (options, fn) {

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
            this.left = null; //node.left;
            this.right = null; //node.right;
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
                leftOffsetSum, // offset from root
                rightOffsetSum; // offset from root


            if (!node /*== null*/ ) {
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
                    leftMost.offset = 0; // ? TODO
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

S.method('array', 'finish', function () {
    this.clearfocus();
    this.leftTo(0);
});

S.method('array', 'swap', function (a, b) {
    this.log('swapping');
    this('temp', this.getItem(a));
    this.setItem(a, this.getItem(b));
    this.setItem(b, this('temp'));
});

S.method('array', 'isSorted', function () {
    for (var i = 1; i < this.getLength(); i++) {
        if (this.getItem(i) < this.getItem(i - 1))
            return false;
    }
    return true;
});


S.method('array', 'searchLinear', function (target) {
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


S.method('array', 'insertionSort', function () {
    for (var i = 0; i < this.getLength(); i++) {
        this('j', i);
        while (this('j') > 0 && this.getItem(this('j') - 1) > this.getItem(this('j'))) {
            //swap:
            /*this.log('swapping');
	        this('temp', this.getItem(this('j')));
	        this.setItem(this('j'), this.getItem(this('j') - 1));
	        this.setItem(this('j') - 1, this('temp'));*/
            this.swap(this('j'), this('j') - 1);
            this('swapped', true);
            this('j', this('j') - 1);
        }
        this.range(0, i, 1); //show sorted portion of array
    }
    this.clearrange(1);
    this.finish();
});

S.method('array', 'bubbleSort', function () {
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
                this.swap(i, i + 1);
                this('swap', true);
                this.clearrange(2);
            }
        }
    }
    this.finish();
});

S.method('array', 'quickSort', function () {
    // TODO
});

S.method('tree', 'finish', function () {
    this.clearfocus();
});

S.method('tree', 'buildBST', function () {
    this.clear();
    this.setNode(this.root(), 12);
    this('left', this.add(this.root(), false, 6));
    this('right', this.add(this.root(), true, 13));
    this.add(this('left'), false, 4);
    this.add(this('right'), true, 14);
});

S.method('tree', 'isBST', function () {

});

S.method('tree', 'traversal', function traversal(kind) {

    var count = 0;
    if (kind)
        kind = kind.trim().toLowerCase();

    if (kind === 'pre' || kind === 'preorder') {
        preorder.call(this, this.root());
    } else if (kind === 'in' || kind === 'inorder') {
        inorder.call(this, this.root());
    } else if (kind === 'post' || kind === 'postorder') {
        postorder.call(this, this.root());
    } else {
        inorder.call(this, this.root());
    }

    this.finish();

    function preorder(node) {
        if (node) {
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
        if (node) {
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
